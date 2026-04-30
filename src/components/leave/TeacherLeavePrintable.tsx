'use client'

import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Props {
  request: any;
}

export function TeacherLeavePrintable({ request }: Props) {
  const teacher = request.teacher;
  const today = new Date();

  return (
    <div className="hidden print:block print-official !m-0 bg-white min-h-screen">
      {/* Memo Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="font-bold text-3xl">บันทึกข้อความ</div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex">
          <span className="font-bold w-32">ส่วนราชการ</span>
          <span className="flex-1 border-b border-dotted border-black">โรงเรียนสอยดาววิทยา สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาจันทบุรี ตราด</span>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-1">
            <span className="font-bold w-12">ที่</span>
            <span className="flex-1 border-b border-dotted border-black">ศธ ....... / ...........</span>
          </div>
          <div className="flex flex-1">
            <span className="font-bold w-12">วันที่</span>
            <span className="flex-1 border-b border-dotted border-black text-center">
              {format(request.createdAt, "d MMMM yyyy", { locale: th })}
            </span>
          </div>
        </div>
        <div className="flex">
          <span className="font-bold w-20">เรื่อง</span>
          <span className="flex-1 border-b border-dotted border-black">
            ขอลา{request.leaveType === 'SICK' ? 'ป่วย' : request.leaveType === 'PERSONAL' ? 'กิจส่วนตัว' : 'พักผ่อน'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex">
          <span className="font-bold">เรียน</span>
          <span className="ml-4">ผู้อำนวยการโรงเรียนสอยดาววิทยา</span>
        </div>

        <div className="indent-16 text-justify">
          ข้าพเจ้า <span className="font-bold">{teacher.prefix}{teacher.firstName} {teacher.lastName}</span>
          ตำแหน่ง <span className="font-bold">{teacher.position || '-'}</span>
          สังกัด <span className="font-bold">กลุ่มสาระฯ / กลุ่มบริหารงาน............................</span>
          มีความประสงค์จะขอลา <span className="font-bold text-lg">{request.leaveType}</span>
          เนื่องจาก <span className="font-bold">{request.reason}</span>
        </div>

        <div className="indent-16">
          ตั้งแต่วันที่ <span className="font-bold">{format(request.startDate, "d MMMM yyyy", { locale: th })}</span>
          ถึงวันที่ <span className="font-bold">{format(request.endDate, "d MMMM yyyy", { locale: th })}</span>
          มีกำหนด <span className="font-bold underline text-xl mx-2">{Number(request.totalDays)}</span> วัน
        </div>

        <div className="indent-16">
          ในระหว่างลาข้าพเจ้าติดต่อได้ที่ <span className="font-bold">{'-'}</span>
          โทรศัพท์ <span className="font-bold">{'-'}</span>
        </div>

        <div className="flex flex-col items-end pt-8 space-y-2">
          <div className="text-center w-64">
            <p className="mb-4">(ลงชื่อ)........................................................</p>
            <p className="">({teacher.prefix}{teacher.firstName} {teacher.lastName})</p>
            <p className="text-sm mt-1">ผู้ขอลา</p>
          </div>
        </div>
      </div>

      {/* Stats Table Section */}
      <div className="mt-12 grid grid-cols-2 gap-12 border-t-2 border-black pt-8">
        {/* Statistics (Bottom Left) */}
        <div className="space-y-4 text-sm border-r border-slate-300 pr-6">
          <p className="font-bold underline mb-4">สถิติการลาในปีงบประมาณนี้</p>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-black p-2">ประเภทการลา</th>
                <th className="border border-black p-2">ลามาแล้ว (วัน)</th>
                <th className="border border-black p-2">ลาครั้งนี้ (วัน)</th>
                <th className="border border-black p-2">รวม (วัน)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">{request.leaveType}</td>
                <td className="border border-black p-2 text-center">{Number(0 || 0)}</td>
                <td className="border border-black p-2 text-center text-lg font-bold">{Number(request.totalDays)}</td>
                <td className="border border-black p-2 text-center font-black">{Number(0 || 0) + Number(request.totalDays)}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="pt-12 text-center space-y-4">
            <p className="mb-2">(ลงชื่อ)........................................................</p>
            <p className="font-bold">({request.staffVerifier?.firstName || '..........................'})</p>
            <p className="text-xs">ผู้ตรวจสอบสถิติ</p>
          </div>
        </div>

        {/* Approval (Bottom Right) */}
        <div className="space-y-12">
          <div className="text-center border-b border-dashed border-slate-400 pb-8">
            <p className="font-bold text-left mb-4">ความเห็นหัวหน้ากลุ่มงาน/กลุ่มสาระ:</p>
            <p className="mb-8">......................................................................</p>
            <p>(ลงชื่อ)........................................................</p>
            <p className="mt-2 text-sm italic">ตำแหน่ง หัวหน้า.....................................</p>
          </div>

          <div className="text-center pt-8">
            <p className="font-bold text-left mb-4">คำสั่ง:</p>
            <div className="flex gap-8 mb-8 justify-center">
              <div className="flex items-center gap-2"><div className="w-4 h-4 border border-black" /> อนุมัติ</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 border border-black" /> ไม่อนุมัติ</div>
            </div>
            <p className="mb-8">......................................................................</p>
            <p>(ลงชื่อ)........................................................</p>
            <p className="mt-2 text-sm italic">ผู้อำนวยการโรงเรียนสอยดาววิทยา</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-20 text-[8pt] text-slate-400 text-right italic">
        Generated by Soidao Digital Intelligence System • Fiscal Year 2567
      </div>
    </div>
  );
}
