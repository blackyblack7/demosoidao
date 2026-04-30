"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { importSGSAction } from "@/app/actions/import-students-sgs";

interface ImportSGSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportSGSModal({ isOpen, onClose }: ImportSGSModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await importSGSAction(formData);
      setResult({
        success: response.success,
        message: response.message || response.error || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ",
      });

      if (response.success) {
        setTimeout(() => {
          onClose();
          setFile(null);
          setResult(null);
        }, 3000);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
        setResult(null);
      } else {
        setResult({ success: false, message: "กรุณาอัปโหลดไฟล์นามสกุล .xls หรือ .xlsx เท่านั้น" });
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">นำเข้าข้อมูลจาก SGS</h2>
                    <p className="text-sm text-slate-500">อัปเดตรายชื่อและเลขที่นั่งเรียน</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-6 bg-blue-50 text-blue-700 p-4 rounded-xl text-sm flex gap-3 items-start">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">คำแนะนำการเตรียมไฟล์:</p>
                    <ul className="list-disc pl-4 space-y-1 text-blue-600/90">
                      <li>ใช้ไฟล์ <b>ใบรายชื่อนักเรียน</b> จากระบบ SGS เท่านั้น (.xls หรือ .xlsx)</li>
                      <li>ระบบจะอัปเดตข้อมูลนักเรียนที่รหัสประจำตัวตรงกัน</li>
                      <li>หากเป็นนักเรียนใหม่ ระบบจะเพิ่มเข้าสู่ฐานข้อมูลอัตโนมัติ</li>
                    </ul>
                  </div>
                </div>

                {/* Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors
                    ${file ? 'border-green-300 bg-green-50/50' : 'border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30'}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className={`p-4 rounded-full ${file ? 'bg-green-100 text-green-600' : 'bg-white text-indigo-500 shadow-sm'}`}>
                      {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                    </div>
                    <div>
                      {file ? (
                        <>
                          <p className="font-semibold text-slate-800 text-lg">{file.name}</p>
                          <p className="text-slate-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-slate-800 text-lg">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
                          <p className="text-slate-500 text-sm mt-1">รองรับไฟล์ .xls และ .xlsx</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Result Message */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                        result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {result.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {result.message}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  disabled={isUploading}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/20"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      กำลังนำเข้า...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      เริ่มนำเข้าข้อมูล
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
