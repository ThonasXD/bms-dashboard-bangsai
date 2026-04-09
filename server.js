const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // อนุญาตให้หน้าเว็บ (Port 3080) ทะลุมาคุยกับ API นี้ได้
app.use(express.json());

// 🌟 1. ตั้งค่าการเชื่อมต่อฐานข้อมูล HOSxP (แก้ให้ตรงกับเซิร์ฟเวอร์จริง)
const db = mysql.createPool({
  host: '192.168.x.x',     // IP ของเครื่องเซิร์ฟเวอร์ HOSxP
  user: 'sa',              // Username ของ MySQL HOSxP
  password: 'your_password',// Password ของ MySQL HOSxP
  database: 'hos',         // ชื่อฐานข้อมูล (ปกติคือ hos)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🌟 2. สร้างเส้นทางสำหรับดึงข้อมูล Auth ว่าง
app.get('/api/missing-auth', (req, res) => {
  const { start, end } = req.query;

  // คำสั่ง SQL ดึงข้อมูลคนไข้ที่มาตามช่วงวันที่ และเลขสิทธิ (auth_code) ว่าง
  // หมายเหตุ: ชื่อฟิลด์ auth_code อาจเปลี่ยนไปตามเวอร์ชัน HOSxP ของคุณ (เช่น hosp_main_auth_code)
  const sql = `
    SELECT 
      o.hn, 
      o.an, 
      o.vstdate as date, 
      concat(p.pname, p.fname, ' ', p.lname) as name, 
      o.auth_code as auth
    FROM ovst o
    LEFT JOIN patient p ON o.hn = p.hn
    WHERE o.vstdate BETWEEN ? AND ?
      AND (o.auth_code IS NULL OR o.auth_code = '')
    LIMIT 500; -- จำกัดไว้ 500 เคสกันเซิร์ฟเวอร์ค้าง
  `;

  db.query(sql, [start, end], (err, results) => {
    if (err) {
      console.error('Database Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล HOSxP' });
    }
    // ส่งข้อมูลกลับไปให้ React
    res.json(results);
  });
});

// เปิดเซิร์ฟเวอร์ API ที่พอร์ต 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend API รันแล้วที่พอร์ต ${PORT}`);
});