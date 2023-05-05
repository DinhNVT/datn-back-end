import multer from "multer";

const storage = multer.diskStorage({
  // Định nghĩa đường dẫn cho file được lưu trữ
  destination: function(req, file, cb) {
    cb(null, './public/uploads/');
  },
  // Định nghĩa tên file được lưu trữ
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

// Khởi tạo middleware multer
const upload = multer({ storage: storage });

export default upload;
