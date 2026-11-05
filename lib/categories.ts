export interface CategoryItem {
  id: string;
  name: string;
  descriptionVi: string;
}

export interface CategoryGroup {
  group: string;
  items: CategoryItem[];
}

export const contentCategories: CategoryGroup[] = [
  {
    group: "Nội thất & Không gian",
    items: [
      { id: "interior_bundle", name: "Tổng hợp Nội thất", descriptionVi: "Giải pháp nội thất toàn diện cho không gian sống." },
      { id: "exterior_bundle", name: "Tổng hợp ngoại thất", descriptionVi: "Thiết kế và nội thất cho không gian ngoài trời." },
      { id: "bed", name: "Bed", descriptionVi: "Giường ngủ: Các loại giường, nệm và phụ kiện phòng ngủ." },
      { id: "nightstand", name: "NightStand", descriptionVi: "Táp đầu giường: Tiện ích và thẩm mỹ cạnh giường." },
      { id: "dresser", name: "Dresser", descriptionVi: "Tủ trang điểm / Tủ đầu giường: Lưu trữ và làm đẹp." },
      { id: "tv_stand", name: "TV Stand/Media Console", descriptionVi: "Kệ tivi: Giải pháp giải trí và lưu trữ phòng khách." },
      { id: "table", name: "Table", descriptionVi: "Bàn: Bàn ăn, bàn làm việc, bàn trà." },
      { id: "chair", name: "Chair", descriptionVi: "Ghế: Ghế ăn, ghế sofa, ghế làm việc." }
    ]
  },
  {
    group: "Social & Viral",
    items: [
      { id: "social", name: "Social", descriptionVi: "Nội dung mạng xã hội tổng hợp." },
      { id: "tiktok", name: "Tiktok", descriptionVi: "Video ngắn, xu hướng trên TikTok." },
      { id: "reels_cat", name: "Reels", descriptionVi: "Instagram/Facebook Reels chuyên nghiệp." },
      { id: "daily", name: "Daily", descriptionVi: "Nội dung đời thường, vlog hàng ngày." }
    ]
  },
  {
    group: "Retail & Commerce",
    items: [
      { id: "fashion", name: "Fashion & Apparel", descriptionVi: "Thời trang & May mặc: Quần áo, túi xách, giày dép." },
      { id: "beauty", name: "Beauty & Skincare", descriptionVi: "Làm đẹp & Chăm sóc da: Mỹ phẩm, spa, skincare." },
      { id: "jewelry", name: "Jewelry & Luxury", descriptionVi: "Trang sức & Đồ xa xỉ: Nhẫn, đồng hồ, phụ kiện cao cấp." },
      { id: "electronics", name: "Consumer Electronics", descriptionVi: "Điện tử tiêu dùng: Điện thoại, loa, tai nghe." },
      { id: "home", name: "Home & Living", descriptionVi: "Nhà cửa & Đời sống: Nội thất, trang trí, gia dụng." }
    ]
  },
  {
    group: "Food & Beverage",
    items: [
      { id: "restaurant", name: "Restaurant & Dining", descriptionVi: "Nhà hàng & Ăn uống: Giới thiệu món ăn, không gian." },
      { id: "beverage", name: "Beverages & Drinks", descriptionVi: "Đồ uống: Cà phê, trà sữa, nước giải khát." },
      { id: "cooking", name: "Cooking & Recipes", descriptionVi: "Nấu ăn & Công thức: Video hướng dẫn chế biến." },
      { id: "bakery", name: "Bakery & Sweets", descriptionVi: "Bánh ngọt & Tráng miệng: Bánh kem, socola, đồ ngọt." },
      { id: "streetfood", name: "Street Food", descriptionVi: "Ẩm thực đường phố: Văn hoá ăn uống vỉa hè." }
    ]
  },
  {
    group: "Tech & Services",
    items: [
      { id: "saas", name: "Software & SaaS", descriptionVi: "Phần mềm & Dịch vụ: App, website, công cụ số." },
      { id: "education", name: "Education & Courses", descriptionVi: "Giáo dục & Khoá học: Đào tạo, học trực tuyến." },
      { id: "finance", name: "Fintech & Finance", descriptionVi: "Tài chính & Công nghệ: Ngân hàng, đầu tư, ví điện tử." },
      { id: "marketing", name: "Digital Marketing", descriptionVi: "Tiếp thị số: Dịch vụ quảng cáo, social media." },
      { id: "realestate", name: "Real Estate", descriptionVi: "Bất động sản: Nhà đất, căn hộ, kiến trúc." }
    ]
  },
  {
    group: "Health & Sports",
    items: [
      { id: "fitness", name: "Fitness & Gym", descriptionVi: "Thể hình & Gym: Tập luyện, thực phẩm bổ sung." },
      { id: "healthcare", name: "Healthcare & Med", descriptionVi: "Y tế & Sức khoẻ: Phòng khám, thực phẩm chức năng." },
      { id: "yoga", name: "Yoga & Wellness", descriptionVi: "Yoga & Tĩnh tâm: Thiền, sức khoẻ tinh thần." },
      { id: "outdoor", name: "Outdoor & Adventure", descriptionVi: "Dã ngoại & Khám phá: Cắm trại, leo núi, trekking." },
      { id: "sports", name: "Professional Sports", descriptionVi: "Thể thao chuyên nghiệp: Bóng đá, tennis, chạy bộ." }
    ]
  },
  {
    group: "Entertainment & Arts",
    items: [
      { id: "music", name: "Music & Concerts", descriptionVi: "Âm nhạc & Sự kiện: MV, live show, biểu diễn." },
      { id: "gaming", name: "Gaming & Esports", descriptionVi: "Trò chơi & Esports: Stream game, review game." },
      { id: "travel", name: "Travel Vlog", descriptionVi: "Vlog Du lịch: Review điểm đến, trải nghiệm." },
      { id: "art", name: "Art & Design", descriptionVi: "Nghệ thuật & Thiết kế: Hội hoạ, đồ hoạ, sáng tạo." },
      { id: "film", name: "Film & Cinema", descriptionVi: "Điện ảnh: Trailer, review phim, hậu trường." }
    ]
  },
  {
    group: "Corporate & Social",
    items: [
      { id: "brandstory", name: "Brand Story", descriptionVi: "Câu chuyện thương hiệu: Lịch sử, tầm nhìn, giá trị." },
      { id: "recruitment", name: "HR & Recruitment", descriptionVi: "Tuyển dụng & Nhân sự: Môi trường làm việc." },
      { id: "csr", name: "Social Impact (CSR)", descriptionVi: "Hoạt động cộng đồng: Từ thiện, bảo vệ môi trường." },
      { id: "testimonial", name: "Testimonials", descriptionVi: "Đánh giá khách hàng: Phản hồi thực tế từ người dùng." },
      { id: "bts", name: "Behind The Scenes", descriptionVi: "Hậu trường: Quy trình sản xuất, làm việc." }
    ]
  }
];