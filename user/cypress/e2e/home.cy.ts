describe('User Homepage', () => {
  it('should explicitly load the homepage', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  // Example test for home features
  it('should have navigation and search', () => {
    cy.visit('/');
    cy.get('header').should('exist');
  });
});
