describe('Use Case: Đăng nhập (Login)', () => {
  beforeEach(() => {
    // Truy cập vào trang Auth trước mỗi text case
    cy.visit('/auth');
  });

  it('1. Đăng nhập thành công', () => {
    // Intercept API đăng nhập để giả lập phản hồi thành công
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
        expiresIn: 900000,
        user: { username: 'user_1', fullName: 'Test User', email: 'test@test.com', roles: ['ROLE_USER'] }
      }
    }).as('loginSuccess');

    // Điền tên đăng nhập
    cy.get('input[name="username"]').type('user_1');

    // Điền mật khẩu
    cy.get('input[name="password"]').type('password');

    // Click nút Đăng nhập
    cy.get('button[type="submit"]').contains('Đăng nhập').click();

    // Chờ API trả về
    cy.wait('@loginSuccess');

    // Kiểm tra xem đã chuyển hướng về trang chủ '/' hay chưa
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
  });

  it('2. Đăng nhập thất bại do sai thông tin', () => {
    // Intercept API đăng nhập để giả lập lỗi
    cy.intercept('POST', '**/auth/login', { 
      statusCode: 401, 
      body: { message: 'Sai tên đăng nhập hoặc mật khẩu' } 
    }).as('loginFail');

    // Điền tên đăng nhập sai
    cy.get('input[name="username"]').type('wronguser123');

    // Điền mật khẩu sai
    cy.get('input[name="password"]').type('wrongpassword');

    // Click nút Đăng nhập
    cy.get('button[type="submit"]').contains('Đăng nhập').click();

    // Chờ api chạy xong (mock context)
    cy.wait('@loginFail');

    // Kiểm tra xem có hiển thị thông báo lỗi hay không
    cy.contains('Sai tên đăng nhập hoặc mật khẩu').should('be.visible');
  });

  it('3. Hiển thị form đăng nhập mặc định', () => {
    // Kiểm tra xem tiêu đề đăng nhập có xuất hiện không
    cy.contains('h2', 'Chào mừng trở lại!').should('be.visible');

    // Nút đăng nhập/đăng ký hiển thị đúng
    cy.contains('button', 'Đăng nhập').should('have.class', 'bg-red-600');

    // Form có chứa các input cần thiết
    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="password"]').should('exist');
  });

  it('4. Chức năng ẩn/hiện mật khẩu trong form đăng nhập', () => {
    // Điền mật khẩu
    cy.get('input[name="password"]').type('mypassword123');

    // Theo mặc định, type của input password là \"password\"
    cy.get('input[name="password"]').should('have.attr', 'type', 'password');

    // Click vào icon mắt để hiện thị mật khẩu (Lưu ý: bạn có thể dùng một selector cụ thể hơn nếu nút mắt có class riêng)
    cy.get('input[name="password"]').next('button').click();

    // Kiểm tra xem type có chuyển sang \"text\" hay không
    cy.get('input[name="password"]').should('have.attr', 'type', 'text');
  });
});
