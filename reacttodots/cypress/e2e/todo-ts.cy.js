describe('example to-do app', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000');
        cy.get('input').type('test');
        cy.contains('Добавить дело').click();
        cy.get('ul li:first-child').should('contain.text', 'test');
    })

    it("дело удаляется", () => {
        cy.get('ul li:first-child').contains('Удалить').click()
    })

    it("дело отмечается", () => {
        cy.get('input[type=checkbox]').click();
        cy.get('p').should('have.css', 'text-decoration');

    })

    it("фильтры", () => {
        cy.get('.count').should('contain.text', '1 осталось выполнить');
        cy.get('input[type=checkbox]').click();
        cy.get('.count').should('contain.text', '0 осталось выполнить');
        cy.get('.active').click();
        cy.contains('ul').should('not.exist')
        cy.get('.ready').click();
        cy.get('ul li:first-child').should('contain.text', 'test');
        cy.get('.clean').click();
        cy.get('ul li:first-child').should('not.exist');
    })
})