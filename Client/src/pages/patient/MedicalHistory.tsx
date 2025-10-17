import { useEffect, useState } from "react";
import { getMyMedicalHistory } from "@/utils/api";

type Diagnosis = { code: string; description: string };
type Medication = { drug: string; dosage: string; frequency: string };
type ClinicalNotes = { subjective?: string; objective?: string };
type Report = { url: string; fileName: string; uploadedAt?: string };

type HistoryItem = {
  id: string;
  consultationDate: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  doctor: { id: string; name: string; email?: string | null; avatarUrl?: string | null } | null;
  diagnosis: Diagnosis[];
  clinicalNotes: ClinicalNotes;
  medications: Medication[];
  recommendedTests: string[];
  medicalReports: Report[];
  createdAt: string;
  updatedAt: string;
};

export default function MedicalHistory() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getMyMedicalHistory();
        setData(res.history || []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load medical history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-50 text-green-700 border-green-200";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
      case "SCHEDULED": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "CANCELLED": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
              <p className="text-gray-600 mt-1">Your complete medical records</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-gray-600">Loading your medical history...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50/30 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
              <p className="text-gray-600 mt-1">Your complete medical records</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-center text-red-600 space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{err}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
            <p className="text-gray-600 mt-1">Your complete medical records</p>
          </div>
          {data.length > 0 && (
            <div className="text-sm text-gray-500">
              {data.length} consultation{data.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No medical history found</h3>
              <p className="text-gray-500">Your medical records will appear here after consultations.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const hasContent = 
                item.diagnosis?.length > 0 ||
                item.clinicalNotes?.subjective ||
                item.clinicalNotes?.objective ||
                item.medications?.length > 0 ||
                item.recommendedTests?.length > 0 ||
                item.medicalReports?.length > 0;

              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {new Date(item.consultationDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.doctor ? (
                              <div className="flex items-center space-x-2">
                                <span>Dr. {item.doctor.name}</span>
                                {item.doctor.email && (
                                  <span className="text-gray-400">•</span>
                                )}
                                {item.doctor.email && (
                                  <span className="text-blue-600">{item.doctor.email}</span>
                                )}
                              </div>
                            ) : (
                              "Doctor: —"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        {hasContent && (
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          >
                            <svg 
                              className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && hasContent && (
                    <div className="p-6 space-y-6 animate-in fade-in duration-200">
                      {/* Diagnosis */}
                      {item.diagnosis?.length > 0 && (
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-semibold text-blue-900">Diagnosis</h3>
                          </div>
                          <div className="grid gap-2">
                            {item.diagnosis.map((d, i) => (
                              <div key={i} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-100">
                                <div className="font-mono text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {d.code}
                                </div>
                                <div className="text-sm text-gray-700 flex-1">{d.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clinical Notes */}
                      {(item.clinicalNotes?.subjective || item.clinicalNotes?.objective) && (
                        <div className="grid md:grid-cols-2 gap-4">
                          {item.clinicalNotes?.subjective && (
                            <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                              <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <h3 className="font-semibold text-orange-900">Subjective Notes</h3>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-orange-100">
                                {item.clinicalNotes.subjective}
                              </p>
                            </div>
                          )}
                          {item.clinicalNotes?.objective && (
                            <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                              <div className="flex items-center space-x-2 mb-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <h3 className="font-semibold text-green-900">Objective Notes</h3>
                              </div>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-green-100">
                                {item.clinicalNotes.objective}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Medications */}
                      {item.medications?.length > 0 && (
                        <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <h3 className="font-semibold text-purple-900">Medications</h3>
                          </div>
                          <div className="overflow-hidden rounded-lg border border-purple-100 bg-white">
                            <table className="min-w-full">
                              <thead>
                                <tr className="bg-purple-50/70">
                                  <th className="text-left p-3 text-sm font-semibold text-purple-900">Drug</th>
                                  <th className="text-left p-3 text-sm font-semibold text-purple-900">Dosage</th>
                                  <th className="text-left p-3 text-sm font-semibold text-purple-900">Frequency</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-purple-100">
                                {item.medications.map((m, i) => (
                                  <tr key={i} className="hover:bg-purple-50/30 transition-colors">
                                    <td className="p-3 text-sm text-gray-700 font-medium">{m.drug}</td>
                                    <td className="p-3 text-sm text-gray-600">{m.dosage}</td>
                                    <td className="p-3 text-sm text-gray-600">{m.frequency}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Recommended Tests */}
                      {item.recommendedTests?.length > 0 && (
                        <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100">
                          <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-semibold text-yellow-900">Recommended Tests</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.recommendedTests.map((t, i) => (
                              <div key={i} className="bg-white px-3 py-2 rounded-lg border border-yellow-200 text-sm text-gray-700 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medical Reports */}
                      {item.medicalReports?.length > 0 && (
                        <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                          <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="font-semibold text-red-900">Medical Reports</h3>
                          </div>
                          <div className="space-y-2">
                            {item.medicalReports.map((r, i) => (
                              <div key={i} className="bg-white p-3 rounded-lg border border-red-100 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">{r.fileName}</div>
                                    {r.uploadedAt && (
                                      <div className="text-xs text-gray-500">
                                        Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <a 
                                  href={r.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                                >
                                  <span>View</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}