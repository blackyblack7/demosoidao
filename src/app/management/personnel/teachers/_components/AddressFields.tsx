"use client"

import { MapPin, Copy } from 'lucide-react';

interface AddressFieldsProps {
  title: string;
  prefix: string; // "current" or ""
  values?: any;
  onChange?: (field: string, value: string) => void;
}

export default function AddressFields({ title, prefix, values = {}, onChange }: AddressFieldsProps) {
  const handleChange = (field: string, value: string) => {
    if (onChange) onChange(field, value);
  };

  const getFieldName = (base: string) => {
    if (prefix === "current") {
      return `current${base.charAt(0).toUpperCase()}${base.slice(1)}`;
    }
    return base;
  };

  return (
    <div className="space-y-4 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
      <div className="flex items-center gap-2 text-slate-800 mb-2">
        <div className="p-1.5 bg-white rounded-lg shadow-sm">
          <MapPin size={16} className="text-blue-500" />
        </div>
        <h4 className="font-bold text-sm tracking-tight">{title}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">บ้านเลขที่ / ถนน / ซอย</label>
          <input 
            type="text" 
            name={getFieldName('houseNumber')} 
            value={values[getFieldName('houseNumber')] || ''}
            onChange={(e) => handleChange(getFieldName('houseNumber'), e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">หมู่ที่</label>
          <input 
            type="text" 
            name={getFieldName('moo')} 
            value={values[getFieldName('moo')] || ''}
            onChange={(e) => handleChange(getFieldName('moo'), e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">ตำบล</label>
          <input 
            type="text" 
            name={getFieldName('subDistrict')} 
            value={values[getFieldName('subDistrict')] || ''}
            onChange={(e) => handleChange(getFieldName('subDistrict'), e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">อำเภอ</label>
          <input 
            type="text" 
            name={getFieldName('district')} 
            value={values[getFieldName('district')] || ''}
            onChange={(e) => handleChange(getFieldName('district'), e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">จังหวัด</label>
          <input 
            type="text" 
            name={getFieldName('province')} 
            value={values[getFieldName('province')] || ''}
            onChange={(e) => handleChange(getFieldName('province'), e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">รหัสไปรษณีย์</label>
          <input 
            type="text" 
            name={getFieldName('zipCode')} 
            value={values[getFieldName('zipCode')] || ''}
            onChange={(e) => handleChange(getFieldName('zipCode'), e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm" 
          />
        </div>
      </div>
    </div>
  );
}
