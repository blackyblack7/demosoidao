const text = "รายชื่อนักเรียน ปีการศึกษา 2569 ภาคเรียนที่ 1  ชั้น ม.1  ห้องที่ 0";
const match = text.match(/ชั้น\s+(ม\.\d+)\s+ห้องที่\s+(\d+)/);
if (match) {
    console.log("Grade:", match[1]);
    console.log("Room:", match[2]);
}
