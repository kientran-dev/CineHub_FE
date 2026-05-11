describe('Admin Authentication', () => {
  it('should redirect unauthenticated users to login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  // Example test for logging in
  it('should allow user to type in login form', () => {
    cy.visit('/login');
    cy.get('input[type="text"]').type('admin');
    cy.get('input[type="password"]').type('password');
    // cy.get('button[type="submit"]').click();
  });
});
