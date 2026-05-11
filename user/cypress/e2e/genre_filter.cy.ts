describe('Use Case: Duyệt phim theo thể loại (Genre Filter)', () => {

  it('1. Truy cập trang danh sách phim theo thể loại', () => {
    // Truy cập trực tiếp vào trang lọc theo thể loại (ví dụ: "Hành động")
    // Route pattern: /movies/the-loai/:genreName
    cy.visit(`/movies/the-loai/${encodeURIComponent('Hành động')}`);

    // Đợi trang tải xong (hết loading spinner)
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Kiểm tra tiêu đề trang hiển thị đúng tên thể loại đã chọn
    cy.contains('h1', 'Hành động').should('be.visible');

    // Kiểm tra URL chứa đúng đường dẫn thể loại
    cy.url().should('include', '/movies/the-loai/');
  });

  it('2. Hiển thị danh sách phim khi chọn thể loại', () => {
    // Truy cập trang lọc theo thể loại
    cy.visit(`/movies/the-loai/${encodeURIComponent('Hành động')}`);

    // Đợi trang tải xong
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Kiểm tra có hiển thị số kết quả tìm được
    cy.contains('Tìm thấy').should('be.visible');
    cy.contains('kết quả').should('be.visible');
  });

  it('3. Hiển thị thông báo khi không có phim nào', () => {
    // Truy cập trực tiếp vào URL thể loại không tồn tại
    cy.visit('/movies/the-loai/TheLoaiKhongTonTai12345');

    // Đợi trang tải xong
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Kiểm tra hiển thị thông báo "Không tìm thấy phim nào"
    cy.contains('Không tìm thấy phim nào').should('be.visible');
  });

  it('4. Bộ lọc chip thể loại hoạt động đúng trên trang Phim lẻ', () => {
    // Truy cập trang Phim lẻ
    cy.visit('/movies/phim-le');

    // Đợi trang tải xong
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Ghi nhận số lượng phim ban đầu (trước khi lọc)
    cy.contains('Tìm thấy').invoke('text').then((textBefore) => {
      // Click vào nút Bộ lọc (nếu bộ lọc đang ẩn)
      // Bộ lọc mặc định đang hiển thị (showFilters = true)
      
      // Tìm và click vào chip thể loại đầu tiên trong panel bộ lọc
      cy.get('button.rounded-full').not('.bg-red-600').first().click();

      // Sau khi click, số lượng kết quả có thể thay đổi
      cy.contains('Tìm thấy').should('be.visible');
    });
  });

  it('5. Tìm kiếm trong trang danh sách phim hoạt động', () => {
    // Truy cập trang Phim lẻ
    cy.visit('/movies/phim-le');

    // Đợi trang tải xong
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Nhập từ khoá tìm kiếm không tồn tại trong ô tìm kiếm của trang danh sách
    cy.get('input[placeholder="Tìm kiếm trong danh sách..."]').type('xyz_khong_ton_tai_abc');

    // Kiểm tra thông báo không tìm thấy
    cy.contains('Không tìm thấy phim nào').should('be.visible');
  });

  it('6. Sắp xếp phim theo tiêu chí hoạt động', () => {
    // Truy cập trang Phim lẻ
    cy.visit('/movies/phim-le');

    // Đợi trang tải xong
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');

    // Thay đổi kiểu sắp xếp sang "Tên A-Z"
    cy.get('select').select('name');

    // Kiểm tra select đã thay đổi giá trị
    cy.get('select').should('have.value', 'name');
  });
});
