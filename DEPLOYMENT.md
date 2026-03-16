## MedTech v3 — دليل النشر المجاني (Full Stack)

هذا الملف يشرح كيفية نشر النظام كاملًا (Frontend + Backend + AI + DB) على الإنترنت باستخدام خدمات مجانية قدر الإمكان.

> المبدأ العام:  
> - Frontend (React/Vite): على منصة استضافة static (مثل Netlify أو Vercel).  
> - Backend (Node/Express): على منصة تدعم Node (مثل Render).  
> - AI Services (FastAPI): على نفس منصة الـ backend أو مشابهة (Render/ Railway).  
> - قاعدة البيانات MySQL: خدمة مجانية/خطة مجانية على Render/Railway أو مزود خارجي.

---

## 1) المتطلبات المسبقة

- حساب GitHub (لرفع الكود).
- حساب على منصات استضافة مجانية (مثال عملي هنا باستخدام **Render** للـ backend/AI، و **Netlify** للـ frontend).
- MySQL مستضاف أونلاين (Render / Railway / مزوّد خارجي).

الكود منظم في جذر المستودع (Repository Root) كالتالي:

- `backend/` — API (Node + Express + Sequelize).
- `frontend/` — واجهة React + Vite.
- `ai/ct_service/` و `ai/xray_service/` — خدمات FastAPI + PyTorch.

تأكد من أن المشروع مرفوع على GitHub بالكامل، وجذر المستودع هو المجلد الذي يحتوي على `frontend` و `backend` و `ai`.

---

## 2) قاعدة البيانات MySQL

1. أنشئ خدمة MySQL مجانية (مثال: على Render أو Railway).
2. احصل على بيانات الاتصال:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
3. لا تنس تشغيل السكربتات التالية على الـ backend بعد النشر لأول مرة:
   - `npm run migrate`
   - `npm run seed`

> حسب المنصة، قد تحتاج تشغيل هذه الأوامر مرة واحدة من خلال "Shell" أو "Jobs".

---

## 3) نشر خدمات الـ AI (CT & X‑Ray) على Render

### 3.1) CT Service

1. أنشئ **New Web Service** في Render:
   - من نفس مستودع GitHub.
   - Root directory: جذر المستودع (المجلد الذي فيه `frontend`, `backend`, `ai`).
   - المسار للخدمة: مجلد `ai/ct_service`.
2. إعدادات الخدمة:
   - Runtime: Python.
   - Build command (اختياري إن لم تُطلب):  
     `pip install -r requirements.txt`
   - Start command:

   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. المتغيرات البيئية المهمة (اختياري/مستحسن):
   - لو تعتمد على Hugging Face:
     - `HUGGINGFACE_HUB_TOKEN` (لو الريبو private).
   - لو ترفع الموديل كملف محلي مع الكود:
     - ارفع `model.pt` بجوار `main.py`.
     - يمكن ضبط `CT_MODEL_PATH=/opt/render/project/src/ai/ct_service/model.pt` (أو المسار الفعلي حسب المنصة).

4. بعد النشر:
   - احصل على URL العام للخدمة، مثل:  
     `https://medtech-ct.onrender.com`
   - تأكد من:
     - `https://medtech-ct.onrender.com/health` يعيد `"status": "ok"`.

### 3.2) X‑Ray Service

كرر نفس الخطوات لكن للمجلد `ai/xray_service`:

- Start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

- إعداد الموديل:
  - إمّا الاعتماد على Hugging Face (`Abooz65/medtech-xray-model`).
  - أو رفع `model.pt` وضبط `XRAY_MODEL_PATH`.

- بعد النشر:
  - خذ URL، مثل:  
    `https://medtech-xray.onrender.com`
  - تأكد من:
    - `https://medtech-xray.onrender.com/health`

---

## 4) نشر الـ Backend (Node/Express) على Render

1. أنشئ **New Web Service** آخر في Render:
   - من نفس المستودع.
   - Root directory: جذر المستودع.
   - المسار للخدمة: مجلد `backend`.
2. إعدادات البناء والتشغيل:
   - Build command:

   ```bash
   npm install
   npm run build
   ```

   - Start command:

   ```bash
   npm run start
   ```

3. المتغيرات البيئية (Environment Variables):

انقل محتوى `.env.example` مع التعديل:

```env
NODE_ENV=production

PORT=10000                # Render يكتبها غالبًا في env باسم PORT، استخدم قيمة $PORT أو اتركها فارغة للسحب التلقائي

DB_HOST=...               # من خدمة MySQL
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...

CT_SERVICE_URL=https://medtech-ct.onrender.com
XRAY_SERVICE_URL=https://medtech-xray.onrender.com

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10

FRONTEND_URL=https://your-frontend.netlify.app
```

- في كثير من المنصات، لا تضع `PORT` يدويًا بل تستخدم المتغيّر `PORT` الذي توفره المنصة (Express يقرأه من `process.env.PORT`).

4. بعد أول تشغيل:
   - نفّذ (مرة واحدة) داخل بيئة الخدمة (Shell/Job):

   ```bash
   npm run migrate
   npm run seed
   ```

5. خُذ URL الخاص بالـ backend:
   - مثال: `https://medtech-backend.onrender.com`
   - صحّة السيرفر:
     - `https://medtech-backend.onrender.com/api/health`

---

## 5) نشر الـ Frontend (React/Vite) على Netlify

1. المشروع على GitHub وجذر المستودع يحتوي على `frontend`, `backend`, `ai`.
2. في Netlify:
   - اختر **New Site from Git**.
   - اختر نفس المستودع، وحدد **Base directory** أو **Root directory** بحيث يكون البناء من مجلد `frontend`.
3. إعدادات البناء:
   - Build command:

   ```bash
   npm run build
   ```

   - Publish directory:

   ```text
   dist
   ```

4. متغيرات البيئة (اختياري لو استخدمت `VITE_API_URL` في الكود):

```env
VITE_API_URL=https://medtech-backend.onrender.com/api
```

وعدّل في `frontend/src/utils/api.ts` (إن رغبت) ليستخدم:

- `baseURL = import.meta.env.VITE_API_URL || '/api'`

5. بعد النشر:
   - احصل على URL، مثل:  
     `https://medtech-frontend.netlify.app`

---

## 6) ربط الأجزاء واختبار الإنتاج

### 6.1) تأكد من الروابط بين الخدمات

- من متصفحك:
  - افتح `https://medtech-ct.onrender.com/health`
  - و `https://medtech-xray.onrender.com/health`
  - و `https://medtech-backend.onrender.com/api/health`

تأكد أن استجابة الـ backend تذكر أن:

- `ctService: "online"`
- `xrayService: "online"`

### 6.2) اختبار من الواجهة

- افتح `https://medtech-frontend.netlify.app`.
- سجّل الدخول بحساب admin الذي تم seed له (إن استخدمت نفس بيانات التهيئة).
- جرّب:
  - رفع X‑Ray و CT.
  - مراجعة النتيجة والـ history.
  - زيارة صفحة المستشفيات.

---

## 7) ملاحظات حول الخطط المجانية

- الخطط المجانية لمنصات مثل Render / Railway / Netlify:
  - قد تقوم بإيقاف الخدمات (sleep) بعد فترة عدم استخدام.
  - أول طلب بعد النوم قد يكون بطيئًا قليلًا.
- لمشروع تجريبي أو عرض (demo) هذه المنصات كافية، لكن للإنتاج الفعلي يفضّل استخدام خطط مدفوعة أو خادم خاص.

---

## 8) ملخص سريع للخطوات

1. ارفع الكود على GitHub (جذر المستودع = المجلد الذي فيه `frontend/`, `backend/`, `ai/`).
2. أنشئ MySQL مستضاف أونلاين واحفظ بيانات الاتصال.
3. انشر:
   - `ai/ct_service` كـ Python Web Service → خذ URL.
   - `ai/xray_service` كـ Python Web Service → خذ URL.
4. انشر `backend` كـ Node Web Service:
   - اضبط env بما في ذلك `CT_SERVICE_URL` و `XRAY_SERVICE_URL` وبيانات MySQL.
   - شغّل `npm run migrate` و `npm run seed` مرة واحدة.
5. انشر `frontend` على Netlify/Vercel:
   - استخدم `npm run build` و `dist` كخرج.
   - اضبط `VITE_API_URL` إن احتجت.
6. اختبر:
   - `/health` لكل خدمة.
   - الفلو الكامل من الواجهة (Login → Upload → Analysis → History).

