# UTE Shop - E-commerce Website

UTE Shop là một website thương mại điện tử được xây dựng bằng React (Frontend) và Node.js (Backend).

## Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:

- Node.js (phiên bản 14.0.0 trở lên)
- npm (Node Package Manager)
- MySQL (phiên bản 5.7 trở lên)

## Cài đặt và Chạy Dự Án

### 1. Clone dự án

```bash
git clone https://github.com/LyHung10/UTE_Shop.git
cd UTE_Shop2
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

#### Cấu hình Database

1. Tạo file `config.json` trong thư mục `backend/src/config` (nếu chưa có)
2. Cấu hình thông tin database trong file `config.json`:

```json
{
  "development": {
    "username": "root",
    "password": "your_password",
    "database": "ute_shop",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

#### Chạy Migrations và Seeders

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```
### 3. Cài đặt Backend và Frontend
#### Khởi động Backend Server
Mở terminal mới và chạy:

```bash
cd backend
npm install
```bash
npm start
```

Backend server sẽ chạy tại địa chỉ: `http://localhost:4000`

#### Khởi động Frontend Server
Mở terminal mới và chạy:

```bash
cd frontend
npm install
```

#### Khởi động Frontend Development Server

```bash
npm run dev
```

Frontend sẽ chạy tại địa chỉ: `http://localhost:5173`

## Cấu trúc Dự Án

```
UTE_Shop2/
├── backend/               # Backend source code
│   ├── src/
│   │   ├── config/       # Cấu hình database và server
│   │   ├── controllers/  # Controllers xử lý logic
│   │   ├── models/       # Models database
│   │   ├── routes/       # Định nghĩa routes
│   │   └── server.js     # Entry point
└── frontend/             # Frontend source code
    ├── src/
    │   ├── components/   # React components
    │   ├── features/     # Feature components
    │   ├── services/     # API services
    │   └── App.jsx       # Root component
```

## Lưu ý

### Khi sử dụng Docker
- Đảm bảo ports 3306, 4000, và 5173 không bị sử dụng bởi các ứng dụng khác
- Nếu cần thay đổi password MySQL, hãy cập nhật trong file `docker-compose.yml`
- Đợi container MySQL khởi động hoàn tất trước khi truy cập ứng dụng
- Logs của các containers có thể xem bằng lệnh `docker-compose logs`

### Khi cài đặt thủ công
- Đảm bảo MySQL server đang chạy trước khi khởi động backend
- Kiểm tra các biến môi trường trong file `.env` (nếu có)
- Nếu gặp lỗi trong quá trình cài đặt, hãy kiểm tra logs và đảm bảo đã cài đặt đúng phiên bản Node.js

## Hỗ trợ

Nếu bạn gặp bất kỳ vấn đề nào, vui lòng tạo issue trên GitHub repository.

## License

[MIT License](https://opensource.org/licenses/MIT)