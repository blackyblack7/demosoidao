"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { ImportSGSModal } from "./ImportSGSModal";

export function ImportSGSButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 transition-all transform hover:-translate-y-1"
      >
        <Upload size={20} />
        นำเข้าข้อมูล SGS
      </button>

      <ImportSGSModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
