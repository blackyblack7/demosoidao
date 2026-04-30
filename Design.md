1. Core Design Philosophy (หลักการออกแบบหลัก)
เว็บไซต์สถาบันการศึกษาที่ไม่น่าเบื่อ เน้นการโชว์ผลงานแบบพรีเมียม ดึงดูดสายตา และใช้งานได้จริงในระดับโปรดักชัน

Aesthetic: Modern, Minimalist, High-Contrast (รองรับ Dark/Light Mode).

Typography: Bold & Oversized Headers (สื่อสารทรงพลัง) + Highly legible Body text.

Media: Full-width images/videos, Parallax scrolling, และ Hover effects แบบนุ่มนวล.

Layout: Asymmetric Grid และ Whitespace ที่เหมาะสม เพื่อนำสายตาผู้ใช้งาน.

2. Responsive & Breakpoints (การรองรับทุกอุปกรณ์)
AI ต้องเขียนด้วย **Next.js (App Router)** ร่วมกับ **Tailwind CSS** และใช้ **Framer Motion** สำหรับทำ Animation แบบมีลูกเล่นทันสมัย โดยยึดหลัก Mobile-First Approach และรองรับอุปกรณ์ทั้ง 4 ระดับดังนี้:

📱 Smartphone (Mobile): max-width: 767px

Rules: แสดงผล 1 คอลัมน์, เมนูแบบ Hamburger, ซ่อนแอนิเมชันที่กินทรัพยากร.

📟 Tablet / iPad (Portrait): min-width: 768px to 1023px

Rules: แสดงผล 2 คอลัมน์สำหรับ Grid, ปรับขนาดฟอนต์ให้พอดีกับการสัมผัส (Touch-friendly).

💻 iPad Pro / Small Laptop: min-width: 1024px to 1279px

Rules: แสดงผล 3 คอลัมน์, เริ่มเปิดใช้งาน Hover effects และแอนิเมชัน Parallax เต็มรูปแบบ.

🖥️ PC / Large Desktop: min-width: 1280px ขึ้นไป

Rules: ควบคุม Max-width ของ Container ไม่ให้กว้างเกินไป (เช่น max-w-7xl), โชว์ Media ขนาดใหญ่ได้เต็มที่.

3. Brand Identity (Design Tokens)
สั่งให้ AI กำหนดตัวแปรเหล่านี้ไว้ใน `tailwind.config.ts` และ Global CSS เสมอ:

3.1 Colors
Background (Dark/Light): #0A0A0A (Dark) / #F9F9F9 (Light)

Surface/Card: #1A1A1A (Dark) / #FFFFFF (Light)

Text Primary: #FFFFFF (Dark) / #111111 (Light)

Text Secondary: #A1A1AA (Gray - ใช้สำหรับวันที่, แท็ก)

Accent Color: #00adef (Primary Blue - ใช้สำหรับปุ่ม CTA และลิงก์สำคัญ)
Accent Secondary: #e23c50 (Primary Red - ใช้สำหรับเน้นส่วนสำคัญรองลงมา)

3.2 Typography
Heading Font: Inter หรือ Sarabun (Weight: 700, 800) - สำหรับ H1, H2, H3

Body Font: Prompt หรือ Kanit (Weight: 300, 400) - สำหรับ Paragraph และ UI Text

4. AI Prompting Guide: Component Breakdown
เวลาที่คุณสั่ง AI ให้ทำเว็บ ให้เรียกทำทีละส่วนตาม Phase ด้านล่างนี้ เพื่อลดข้อผิดพลาด:

🔴 Phase 1: Global Layout & Navigation
Component 1: Sticky Navbar * Specs: พื้นหลังโปร่งใสเบลอ (Glassmorphism), โลโก้ซ้าย, เมนูขวา. บน Mobile เปลี่ยนเป็น Full-screen overlay menu.

Component 2: Footer

Specs: เรียบง่าย, มีช่อง Newsletter, ลิงก์โซเชียล, และที่อยู่โรงเรียน. ใช้ตัวอักษรสี Secondary

🟡 Phase 2: Core UI Sections (Awwwards Style)
Component 3: Hero Section

Specs: ความสูง 100vh, วิดีโอ/ภาพพื้นหลังขนาดใหญ่, ข้อความ H1 ขนาดใหญ่อยู่ตรงกลาง (เช่น "Shape the Future"), ปุ่ม Call to Action (CTA) สไตล์มินิมอล.

Component 4: Showcase Grid (Masonry)

Specs: ตารางแสดงผลงานนักเรียนและข่าวสาร. ใช้การจัดวางแบบ Masonry. เมื่อ Hover ภาพให้ขยายสเกล 1.05x พร้อมกับโชว์ Overlay ชื่อโปรเจกต์.

Component 5: Infinite Marquee

Specs: แถบข้อความวิ่งแนวนอนสำหรับประกาศด่วนหรือรายชื่อสาขาวิชา.

🟢 Phase 3: Next.js Backend & CMS Data Structure (WordPress-like Mockup)
หากให้ AI เขียนระบบ Backend / API Routes ผ่าน Next.js ให้ยึดโครงสร้าง Data Models ดังนี้:

Users: id, role (Admin, Editor, Student), name, avatar.

Posts (News/Events): id, title, content, cover_image, publish_date, author_id.

Portfolios (Student Work): id, project_name, student_name, tech_stack_tags, gallery_urls, featured_score (สำหรับขึ้นโชว์แบบ Awwwards Site of the Day).

5. Micro-Interactions & Performance (ข้อกำหนดพิเศษสำหรับ AI)
ทุกครั้งที่มีการใช้รูปภาพ AI ต้องเขียนโค้ดรองรับ Lazy Loading เสมอ

ปุ่ม (Buttons) และลิงก์ (Links) ต้องมี State (:hover, :focus, :active) ที่ชัดเจนและสมูท (Transition 0.3s)

การเลื่อนหน้าจอ (Scrolling) ควรนุ่มนวล แต่ไม่ต้องใส่ Scroll Hijacking ให้เสีย Usability แบบเว็บยุคเก่า