import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import {
  FormData,
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
} from "@/utils/api";
import { QRCodeSVG } from "qrcode.react";

type UserMe = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  patientId?: string | number;
  dateOfBirth?: string; // ISO
  gender?: "Male" | "Female" | "Other";
  bloodGroup?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: { name?: string; phone?: string; relation?: string };
};

const Input = (p: JSX.IntrinsicElements["input"]) => (
  <input
    {...p}
    className="w-full rounded-md border px-3 py-2 text-sm outline-none border-slate-300 focus:border-blue-600"
  />
);
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-slate-700 mb-1">
    {children}
  </label>
);

export default function Profile() {
  const navigate = useNavigate();
  const auth = useAuth() as any;

  // bootstrap from auth.user or localStorage while the API loads
  const bootstrapUser = (): UserMe | null => {
    const ctxUser = auth?.user as UserMe | undefined;
    if (ctxUser) return ctxUser;
    try {
      const raw = localStorage.getItem("user");
      if (raw) return JSON.parse(raw) as UserMe;
    } catch {}
    return null;
  };

  const [me, setMe] = useState<UserMe | null>(bootstrapUser());
  const [saving, setSaving] = useState(false);

  // password state
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  // QR code state
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // fetch authoritative profile from API
  useEffect(() => {
    (async () => {
      try {
        const response = await getProfile();
        const data = response.data || response; // Handle both {data: user} and direct user response

        // Transform the data to match UserMe structure if needed
        const transformedData = {
          ...data,
          _id: data._id || data.id,
          patientId: data.patientId || data._id,
          dateOfBirth: data.dateOfBirth || undefined,
          gender: data.gender || undefined,
          bloodGroup: data.bloodGroup || undefined,
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            zipCode: data.address?.zipCode || "",
            country: data.address?.country || "",
          },
          emergencyContact: {
            name: data.emergencyContact?.name || "",
            phone: data.emergencyContact?.phone || "",
            relation: data.emergencyContact?.relation || "",
          },
        };

        setMe(transformedData);
        // keep cache in sync
        localStorage.setItem("user", JSON.stringify(transformedData));
        // update auth context if possible
        auth?.setUser?.(transformedData);
        auth?.updateUser?.(transformedData);
      } catch (e: any) {
        // if unauthorized, redirect to login
        if (
          e?.message?.includes("authentication") ||
          e?.message?.includes("token")
        ) {
          auth?.setUser?.(null);
          navigate("/signin");
        }
        if (e?.message) toast.error(e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = useMemo(() => {
    if (!me) return "";
    const full = [me.firstName, me.lastName].filter(Boolean).join(" ").trim();
    return full || me.email?.split("@")[0] || "User";
  }, [me]);

  function syncEverywhere(patch: any) {
    // Accept object or updater function
    if (typeof patch === "function") {
      auth?.setUser?.(patch);
      auth?.updateUser?.(patch);
      try {
        const raw = localStorage.getItem("user");
        const cur = raw ? JSON.parse(raw) : null;
        const next = patch(cur);
        if (next) localStorage.setItem("user", JSON.stringify(next));
      } catch {}
    } else {
      auth?.setUser?.(patch);
      auth?.updateUser?.(patch);
      try {
        localStorage.setItem("user", JSON.stringify(patch));
      } catch {}
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    setSaving(true);
    try {
      const updated = await updateProfile(me as unknown as Partial<FormData>);
      setMe(updated);
      syncEverywhere(updated);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(file?: File) {
    if (!file) return;
    try {
      const res = await uploadAvatar(file); // { avatarUrl }
      setMe((m) => (m ? { ...m, avatarUrl: res.avatarUrl } : m));
      syncEverywhere((u: any) => (u ? { ...u, avatarUrl: res.avatarUrl } : u));
      toast.success("Photo updated");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (newPwd !== newPwd2) return toast.error("Passwords do not match");
    setPwdSaving(true);
    try {
      await changePassword({ oldPassword: oldPwd, newPassword: newPwd });
      setOldPwd("");
      setNewPwd("");
      setNewPwd2("");
      toast.success("Password changed");
    } catch (e: any) {
      toast.error(e?.message || "Could not change password");
    } finally {
      setPwdSaving(false);
    }
  }

  // Function to download QR code
  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `patient-${me?._id}-qrcode.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!me) {
    return (
      <div className="px-6 md:px-8 py-6">
        <div className="text-slate-500">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-6 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-6">
        My Profile
      </h1>

      {/* Header */}
      <div className="bg-white border rounded-xl p-5 mb-6 flex items-center gap-4">
        <Avatar name={displayName} url={me.avatarUrl} onPick={onAvatarChange} />
        <div className="flex-1">
          <div className="text-lg font-semibold text-slate-800">
            {displayName}
          </div>
          <div className="text-sm text-slate-600">{me.email}</div>
          {me.patientId && (
            <div className="text-xs text-slate-500 mt-1">
              Patient ID:{" "}
              <span className="font-medium">#{String(me.patientId)}</span>
            </div>
          )}
          {/* QR Code Button */}
          {(me._id || me.id) && (
            <button
              onClick={() => setShowQR(!showQR)}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200 transition"
            >
              {showQR ? "Hide QR Code" : "Show QR Code"}
            </button>
          )}
        </div>
      </div>

      {/* QR Code Display */}
      {showQR && (me?._id || me?.id) && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Your Patient QR Code
            </h3>
            <p className="text-sm text-slate-600 mb-4 text-center">
              Scan this QR code to access your patient records
            </p>

            {/* QR Code */}
            <div ref={qrRef} className="p-4 bg-white rounded-lg border">
              <QRCodeSVG
                value={JSON.stringify({ userId: me._id || me.id })}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <p className="text-xs text-slate-500 mt-2">
              User ID: {me._id || me.id}
            </p>

            <button
              onClick={downloadQRCode}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Details form */}
      <form onSubmit={onSave} className="space-y-6">
        <Section title="Personal Information">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>First name</Label>
              <Input
                value={me.firstName || ""}
                onChange={(e) =>
                  setMe({ ...me, firstName: e.currentTarget.value })
                }
              />
            </div>
            <div>
              <Label>Last name</Label>
              <Input
                value={me.lastName || ""}
                onChange={(e) =>
                  setMe({ ...me, lastName: e.currentTarget.value })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={me.email} readOnly />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={me.phone || ""}
                onChange={(e) => setMe({ ...me, phone: e.currentTarget.value })}
              />
            </div>
            <div>
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={me.dateOfBirth ? me.dateOfBirth.slice(0, 10) : ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    dateOfBirth: new Date(e.currentTarget.value).toISOString(),
                  })
                }
              />
            </div>
            <div>
              <Label>Gender</Label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600"
                value={me.gender || ""}
                onChange={(e) =>
                  setMe({ ...me, gender: e.currentTarget.value as any })
                }
              >
                <option value="">Select…</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <Label>Blood group</Label>
              <Input
                placeholder="e.g., O+"
                value={me.bloodGroup || ""}
                onChange={(e) =>
                  setMe({ ...me, bloodGroup: e.currentTarget.value })
                }
              />
            </div>
          </div>
        </Section>

        <Section title="Address">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Street</Label>
              <Input
                value={me.address?.street || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    address: { ...me.address, street: e.currentTarget.value },
                  })
                }
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={me.address?.city || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    address: { ...me.address, city: e.currentTarget.value },
                  })
                }
              />
            </div>
            <div>
              <Label>State/Province</Label>
              <Input
                value={me.address?.state || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    address: { ...me.address, state: e.currentTarget.value },
                  })
                }
              />
            </div>
            <div>
              <Label>Zip/Postal code</Label>
              <Input
                value={me.address?.zipCode || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    address: { ...me.address, zipCode: e.currentTarget.value },
                  })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Country</Label>
              <Input
                value={me.address?.country || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    address: { ...me.address, country: e.currentTarget.value },
                  })
                }
              />
            </div>
          </div>
        </Section>

        <Section title="Emergency Contact">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={me.emergencyContact?.name || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    emergencyContact: {
                      ...me.emergencyContact,
                      name: e.currentTarget.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={me.emergencyContact?.phone || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    emergencyContact: {
                      ...me.emergencyContact,
                      phone: e.currentTarget.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label>Relation</Label>
              <Input
                value={me.emergencyContact?.relation || ""}
                onChange={(e) =>
                  setMe({
                    ...me,
                    emergencyContact: {
                      ...me.emergencyContact,
                      relation: e.currentTarget.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white bg-blue-700 hover:bg-blue-800 ${
              saving ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <span className="text-slate-500 text-sm">
            These details are used for appointments.
          </span>
        </div>
      </form>

      <Section title="Change Password" className="mt-8">
        <form onSubmit={onChangePassword} className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Current password</Label>
            <Input
              type="password"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.currentTarget.value)}
            />
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.currentTarget.value)}
            />
          </div>
          <div>
            <Label>Confirm new password</Label>
            <Input
              type="password"
              value={newPwd2}
              onChange={(e) => setNewPwd2(e.currentTarget.value)}
            />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={pwdSaving}
              className={`px-4 py-2 rounded-md text-white bg-slate-700 hover:bg-slate-800 ${
                pwdSaving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {pwdSaving ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${className}`}>
      <div className="text-slate-800 font-semibold mb-4">{title}</div>
      {children}
    </div>
  );
}

function Avatar({
  url,
  name,
  onPick,
}: {
  url?: string;
  name: string;
  onPick: (file?: File) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {url ? (
        <img
          src={url}
          alt="avatar"
          className="w-16 h-16 rounded-full object-cover border"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <label className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 cursor-pointer">
        Change photo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
