import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { getMe, updateMe, uploadAvatar, changePassword } from "@/utils/api";
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
  address?: { street?: string; city?: string; state?: string; zipCode?: string; country?: string };
  emergencyContact?: { name?: string; phone?: string; relation?: string };
};

const Input = (p: JSX.IntrinsicElements["input"]) => (
  <input
    {...p}
    className="w-full rounded-xl border px-4 py-3 text-sm outline-none border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200"
  />
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-2 tracking-wide">{children}</label>
);

export default function Profile() {
  // Don't assume setUser exists; use the context bag as-is
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
        const data = await getMe();
        setMe(data);
        // keep cache in sync
        localStorage.setItem("user", JSON.stringify(data));
        // update auth context if possible
        auth?.setUser?.(data);
        auth?.updateUser?.(data);
      } catch (e: any) {
        // if unauthorized, you'll still see bootstrap user; that's fine
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
      const updated = await updateMe(me);
      setMe(updated);
      syncEverywhere(updated);
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (e: any) {
      toast.error(e?.message || "Update failed", {
        position: "top-right",
        autoClose: 3000,
      });
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
      toast.success("Profile photo updated!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (e: any) {
      toast.error(e?.message || "Upload failed", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd.length < 6) return toast.error("New password must be at least 6 characters", {
      position: "top-right",
      autoClose: 3000,
    });
    if (newPwd !== newPwd2) return toast.error("Passwords do not match", {
      position: "top-right",
      autoClose: 3000,
    });
    setPwdSaving(true);
    try {
      await changePassword({ oldPassword: oldPwd, newPassword: newPwd });
      setOldPwd(""); setNewPwd(""); setNewPwd2("");
      toast.success("Password changed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (e: any) {
      toast.error(e?.message || "Could not change password", {
        position: "top-right",
        autoClose: 3000,
      });
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
      <div className="px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="bg-slate-200 rounded-full h-24 w-24"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-600 mt-2">Manage your personal information and account settings</p>
        </div>

        {/* Header Card with Gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-1 shadow-xl mb-8 transform transition-transform hover:scale-[1.01] duration-300">
          <div className="bg-white rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative group">
                <div className="absolute -inset-2 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <Avatar name={displayName} url={me.avatarUrl} onPick={onAvatarChange} />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{displayName}</h2>
                <p className="text-slate-600 mb-4">{me.email}</p>
                
                {me.patientId && (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-bold mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Patient ID: <span className="ml-1">#{String(me.patientId)}</span>
                  </div>
                )}
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                  {(me._id || me.id) && (
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      {showQR ? "Hide QR Code" : "Show QR Code"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Display with Animation */}
        {showQR && (me?._id || me?.id) && (
          <div className="bg-white rounded-3xl p-1 shadow-xl mb-8 transform transition-all duration-500 ease-in-out animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Your Patient QR Code</h3>
                <p className="text-slate-600 mb-6 text-center max-w-md">
                  Scan this QR code to access your patient records quickly
                </p>
                
                {/* QR Code with Glow Effect */}
                <div className="relative mb-6">
                  <div className="absolute -inset-4 bg-blue-500 rounded-2xl blur opacity-20"></div>
                  <div ref={qrRef} className="relative bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-2xl">
                    <QRCodeSVG
                      value={JSON.stringify({ userId: me._id || me.id })}
                      size={220}
                      level={"H"}
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#1e40af"
                    />
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-4 font-medium">
                  User ID: {me._id || me.id}
                </p>
                  
                <button
                  onClick={downloadQRCode}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={onSave} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-3xl p-1 shadow-xl transform transition-transform hover:scale-[1.005] duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="border-b border-slate-200 pb-5 mb-7">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Personal Information</h3>
                </div>
                <p className="text-slate-600">Update your personal details here</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={me.firstName || ""}
                    onChange={(e) => setMe({ ...me, firstName: e.currentTarget.value })}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={me.lastName || ""}
                    onChange={(e) => setMe({ ...me, lastName: e.currentTarget.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={me.email} readOnly className="bg-slate-50 cursor-not-allowed" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={me.phone || ""}
                    onChange={(e) => setMe({ ...me, phone: e.currentTarget.value })}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={me.dateOfBirth ? me.dateOfBirth.slice(0, 10) : ""}
                    onChange={(e) =>
                      setMe({ ...me, dateOfBirth: new Date(e.currentTarget.value).toISOString() })
                    }
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all duration-200"
                    value={me.gender || ""}
                    onChange={(e) => setMe({ ...me, gender: e.currentTarget.value as any })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <Input
                    placeholder="e.g., O+"
                    value={me.bloodGroup || ""}
                    onChange={(e) => setMe({ ...me, bloodGroup: e.currentTarget.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-3xl p-1 shadow-xl transform transition-transform hover:scale-[1.005] duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="border-b border-slate-200 pb-5 mb-7">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Address Information</h3>
                </div>
                <p className="text-slate-600">Your residential address details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label>Street Address</Label>
                  <Input
                    value={me.address?.street || ""}
                    onChange={(e) =>
                      setMe({ ...me, address: { ...me.address, street: e.currentTarget.value } })
                    }
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={me.address?.city || ""}
                    onChange={(e) =>
                      setMe({ ...me, address: { ...me.address, city: e.currentTarget.value } })
                    }
                  />
                </div>
                <div>
                  <Label>State/Province</Label>
                  <Input
                    value={me.address?.state || ""}
                    onChange={(e) =>
                      setMe({ ...me, address: { ...me.address, state: e.currentTarget.value } })
                    }
                  />
                </div>
                <div>
                  <Label>Zip/Postal Code</Label>
                  <Input
                    value={me.address?.zipCode || ""}
                    onChange={(e) =>
                      setMe({ ...me, address: { ...me.address, zipCode: e.currentTarget.value } })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Country</Label>
                  <Input
                    value={me.address?.country || ""}
                    onChange={(e) =>
                      setMe({ ...me, address: { ...me.address, country: e.currentTarget.value } })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="bg-white rounded-3xl p-1 shadow-xl transform transition-transform hover:scale-[1.005] duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="border-b border-slate-200 pb-5 mb-7">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Emergency Contact</h3>
                </div>
                <p className="text-slate-600">Who should we contact in case of emergency</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Contact Name</Label>
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
                  <Label>Phone Number</Label>
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
                  <Label>Relationship</Label>
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
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-3xl p-1 shadow-xl">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">These details are used for your appointments and medical records</span>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-4 rounded-xl text-white font-bold text-lg flex items-center gap-3 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
                    saving 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:shadow-2xl"
                  }`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="bg-white rounded-3xl p-1 shadow-xl mt-8 transform transition-transform hover:scale-[1.005] duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="border-b border-slate-200 pb-5 mb-7">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Change Password</h3>
              </div>
              <p className="text-slate-600">Update your account password</p>
            </div>
            
            <form onSubmit={onChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Current Password</Label>
                <Input 
                  type="password" 
                  value={oldPwd} 
                  onChange={(e) => setOldPwd(e.currentTarget.value)} 
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  value={newPwd} 
                  onChange={(e) => setNewPwd(e.currentTarget.value)} 
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input 
                  type="password" 
                  value={newPwd2} 
                  onChange={(e) => setNewPwd2(e.currentTarget.value)} 
                  placeholder="Confirm new password"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={pwdSaving}
                  className={`px-8 py-4 rounded-xl text-white font-bold text-lg flex items-center gap-3 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
                    pwdSaving 
                      ? "bg-slate-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 hover:shadow-2xl"
                  }`}
                >
                  {pwdSaving ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl p-1 shadow-xl ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <div className="text-slate-800 font-bold mb-4">{title}</div>
        {children}
      </div>
    </div>
  );
}

function Avatar({ url, name, onPick }: { url?: string; name: string; onPick: (file?: File) => void }) {
  return (
    <div className="flex items-center gap-4">
      {url ? (
        <img src={url} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-2xl" />
      ) : (
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-2xl border-4 border-white">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <label className="hidden md:inline-flex items-center gap-2 text-base px-5 py-3 rounded-xl border bg-white hover:bg-slate-50 cursor-pointer shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Change Photo
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
      </label>
    </div>
  );
}