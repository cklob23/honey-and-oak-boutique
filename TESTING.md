# Honey & Oak Boutique - Testing Guide

## Frontend Testing

### Unit Tests

\`\`\`bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
\`\`\`

Example test file: \`components/__tests__/product-card.test.tsx\`

\`\`\`typescript
import { render, screen } from "@testing-library/react"
import { ProductCard } from "@/components/product-card"

describe("ProductCard", () => {
  it("displays product name", () => {
    const product = {
      _id: "1",
      name: "Test Product",
      price: 99.99,
      images: [{ url: "/test.jpg" }],
    }
    render(<ProductCard product={product} />)
    expect(screen.getByText("Test Product")).toBeInTheDocument()
  })
})
\`\`\`

### Integration Tests

Test complete user flows like checkout, product addition, etc.

\`\`\`bash
npm install --save-dev cypress
npx cypress open
\`\`\`

Example: \`cypress/e2e/checkout.cy.ts\`

\`\`\`typescript
describe("Checkout Flow", () => {
  it("completes purchase successfully", () => {
    cy.visit("/")
    cy.get("[data-testid=add-to-cart]").first().click()
    cy.visit("/cart")
    cy.get("[data-testid=checkout-btn]").click()
    cy.get("[data-testid=email-input]").type("test@example.com")
    cy.get("[data-testid=pay-btn]").click()
    cy.url().should("include", "/order-confirmation")
  })
})
\`\`\`

## Backend Testing

### Unit Tests

\`\`\`bash
npm install --save-dev jest supertest
\`\`\`

Example test: \`backend/src/routes/__tests__/products.test.js\`

\`\`\`javascript
const request = require('supertest');
const app = require('../../server');

describe('Products API', () => {
  it('GET /api/products returns all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/products/:id returns single product', async () => {
    const res = await request(app).get('/api/products/123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
  });
});
\`\`\`

### API Testing

Use Postman or Insomnia for manual API testing:

1. **Create Product**
   - Method: POST
   - URL: http://localhost:5000/api/products
   - Body: \`{ "name": "Test", "price": 99.99, ... }\`

2. **Create Cart**
   - Method: POST
   - URL: http://localhost:5000/api/cart

3. **Add to Cart**
   - Method: POST
   - URL: http://localhost:5000/api/cart/:cartId/items

4. **Checkout**
   - Method: POST
   - URL: http://localhost:5000/api/checkout

## Payment Testing

### Square Sandbox Mode

Use test card numbers:
- Visa: 4111 1111 1111 1111
- Mastercard: 5555 5555 5555 4444
- Amex: 378282246310005

Any future expiration date and any CVC.

## Manual Testing Checklist

### Customer Journey
- [ ] Browse products
- [ ] Search functionality works
- [ ] Filter by category works
- [ ] View product details
- [ ] Add items to cart
- [ ] Update cart quantities
- [ ] Apply discount codes
- [ ] Use gift card
- [ ] Complete checkout
- [ ] Receive order confirmation email
- [ ] View order in account

### Admin Features
- [ ] Login to admin dashboard
- [ ] View sales analytics
- [ ] View recent orders
- [ ] Update order status
- [ ] Create new product
- [ ] Update inventory
- [ ] View reports
- [ ] Export data

### Payment Methods
- [ ] Credit card payment
- [ ] Apple Pay
- [ ] Google Pay
- [ ] Gift card payment

### Mobile Responsiveness
- [ ] Mobile menu works
- [ ] Touch interactions work
- [ ] Checkout works on mobile
- [ ] Forms are readable

## Performance Testing

### Load Testing

\`\`\`bash
npm install --save-dev artillery

# Create artillery/load.yml
artillery run artillery/load.yml
\`\`\`

### Lighthouse Audit

\`\`\`bash
npm install --save-dev @lhci/cli@0.x @lhci/server
lhci autorun
\`\`\`

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Form labels present
- [ ] Alt text on images

## Security Testing

- [ ] No sensitive data in logs
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF tokens present
- [ ] Rate limiting works

## Test Coverage

\`\`\`bash
# Generate coverage report
npm test -- --coverage

# Target: 80%+ coverage
\`\`\`

## CI/CD Testing

Automated tests should run on:
- [ ] Every pull request
- [ ] Before merging to main
- [ ] Before production deployment

Example GitHub Actions workflow:

\`\`\`yaml
name: Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run build
\`\`\`

## Bug Reporting

When reporting bugs, include:
1. **Reproduction steps**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser/device info**
5. **Screenshots/videos**
6. **Error logs**

## Sign-off

Before production release:
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Accessibility checked
- [ ] Team approval
\`\`\`
