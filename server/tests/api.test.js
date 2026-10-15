const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_12345';

const { app } = require('../server');
const User = require('../models/User');
const Application = require('../models/Application');

let mongoServer;

describe('InternTrack Backend API Test Suite', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Application.deleteMany({});
  });

  describe('Health Check Endpoint', () => {
    it('GET /api/health should return 200 and ok status', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
    });
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register should register a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.name, 'Jane Doe');
      assert.equal(res.body.email, 'jane@example.com');
      assert.ok(res.body.token);
      assert.equal(res.body.password, undefined);

      // Verify password hashed in database
      const dbUser = await User.findOne({ email: 'jane@example.com' });
      assert.ok(dbUser);
      assert.notEqual(dbUser.password, 'password123');
    });

    it('POST /api/auth/register should fail on duplicate email', async () => {
      await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Clone',
          email: 'jane@example.com',
          password: 'password123'
        });

      assert.equal(res.status, 400);
      assert.match(res.body.message, /already exists/i);
    });

    it('POST /api/auth/register should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: '123'
        });

      assert.equal(res.status, 400);
      assert.match(res.body.message, /at least 6 characters/i);
    });

    it('POST /api/auth/login should authenticate user with correct credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Smith',
          email: 'john@example.com',
          password: 'securepassword'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'securepassword'
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.name, 'John Smith');
      assert.ok(res.body.token);
    });

    it('POST /api/auth/login should reject invalid password', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Smith',
          email: 'john@example.com',
          password: 'securepassword'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        });

      assert.equal(res.status, 401);
      assert.match(res.body.message, /invalid/i);
    });

    it('GET /api/auth/me should return current user info when authenticated', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alice',
          email: 'alice@example.com',
          password: 'password123'
        });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.email, 'alice@example.com');
      assert.equal(res.body.name, 'Alice');
      assert.equal(res.body.password, undefined);
    });

    it('GET /api/auth/me should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      assert.equal(res.status, 401);
      assert.match(res.body.message, /no token provided/i);
    });
  });

  describe('Application CRUD & Stats Endpoints', () => {
    let tokenUserA;
    let tokenUserB;

    beforeEach(async () => {
      const userA = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User A', email: 'usera@example.com', password: 'password123' });
      tokenUserA = userA.body.token;

      const userB = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User B', email: 'userb@example.com', password: 'password123' });
      tokenUserB = userB.body.token;
    });

    it('POST /api/applications should create an application for the user', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          company: 'Google',
          role: 'SWE Intern',
          status: 'Applied',
          notes: 'Applied via careers portal',
          link: 'https://careers.google.com'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.company, 'Google');
      assert.equal(res.body.role, 'SWE Intern');
      assert.equal(res.body.status, 'Applied');
      assert.ok(res.body._id);
    });

    it('POST /api/applications should validate required fields', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({
          company: '',
          role: ''
        });

      assert.equal(res.status, 400);
      assert.match(res.body.message, /Company name is required/i);
    });

    it('GET /api/applications should return only the current user applications', async () => {
      // User A creates 2 applications
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Google', role: 'SWE Intern', status: 'Applied' });

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Microsoft', role: 'PM Intern', status: 'Interview' });

      // User B creates 1 application
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ company: 'Amazon', role: 'SDE Intern', status: 'Offer' });

      // User A fetches applications
      const resUserA = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`);

      assert.equal(resUserA.status, 200);
      assert.equal(resUserA.body.length, 2);
      assert.ok(resUserA.body.every((app) => ['Google', 'Microsoft'].includes(app.company)));

      // User B fetches applications
      const resUserB = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${tokenUserB}`);

      assert.equal(resUserB.status, 200);
      assert.equal(resUserB.body.length, 1);
      assert.equal(resUserB.body[0].company, 'Amazon');
    });

    it('GET /api/applications should filter by status', async () => {
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Meta', role: 'Frontend Intern', status: 'Applied' });

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Netflix', role: 'Backend Intern', status: 'Interview' });

      const res = await request(app)
        .get('/api/applications?status=Interview')
        .set('Authorization', `Bearer ${tokenUserA}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.length, 1);
      assert.equal(res.body[0].company, 'Netflix');
    });

    it('GET /api/applications should search by company or role', async () => {
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Stripe', role: 'Infrastructure Intern', status: 'Applied' });

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Apple', role: 'iOS Intern', status: 'Applied' });

      const resByCompany = await request(app)
        .get('/api/applications?search=stripe')
        .set('Authorization', `Bearer ${tokenUserA}`);

      assert.equal(resByCompany.status, 200);
      assert.equal(resByCompany.body.length, 1);
      assert.equal(resByCompany.body[0].company, 'Stripe');

      const resByRole = await request(app)
        .get('/api/applications?search=ios')
        .set('Authorization', `Bearer ${tokenUserA}`);

      assert.equal(resByRole.status, 200);
      assert.equal(resByRole.body.length, 1);
      assert.equal(resByRole.body[0].company, 'Apple');
    });

    it('PUT /api/applications/:id should update status and application details', async () => {
      const created = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Uber', role: 'Mobile Intern', status: 'Applied' });

      const updateRes = await request(app)
        .put(`/api/applications/${created.body._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ status: 'Interview', notes: 'First round scheduled for Tuesday' });

      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.status, 'Interview');
      assert.equal(updateRes.body.notes, 'First round scheduled for Tuesday');
    });

    it('PUT /api/applications/:id should prevent User B from updating User A application', async () => {
      const created = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Uber', role: 'Mobile Intern', status: 'Applied' });

      const updateRes = await request(app)
        .put(`/api/applications/${created.body._id}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ status: 'Offer' });

      assert.equal(updateRes.status, 404);
      assert.match(updateRes.body.message, /not found/i);
    });

    it('DELETE /api/applications/:id should delete an application', async () => {
      const created = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Airbnb', role: 'Fullstack Intern' });

      const deleteRes = await request(app)
        .delete(`/api/applications/${created.body._id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      assert.equal(deleteRes.status, 200);
      assert.match(deleteRes.body.message, /removed successfully/i);

      // Verify application no longer exists
      const listRes = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`);
      assert.equal(listRes.body.length, 0);
    });

    it('GET /api/applications/stats should return accurate application counts per status', async () => {
      // Create applications across different statuses
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Company 1', role: 'Role 1', status: 'Applied' });

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Company 2', role: 'Role 2', status: 'Interview' });

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Company 3', role: 'Role 3', status: 'Offer' });

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ company: 'Company 4', role: 'Role 4', status: 'Rejected' });

      const res = await request(app)
        .get('/api/applications/stats')
        .set('Authorization', `Bearer ${tokenUserA}`);

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        total: 4,
        Applied: 1,
        Interview: 1,
        Offer: 1,
        Rejected: 1
      });
    });
  });

  describe('AI Follow-Up Message Endpoint', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Alex Intern', email: 'alex@example.com', password: 'password123' });
      token = reg.body.token;
    });

    it('POST /api/ai/followup should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/ai/followup')
        .send({ company: 'Google', role: 'SWE Intern', status: 'Applied' });

      assert.equal(res.status, 401);
    });

    it('POST /api/ai/followup should require company and role', async () => {
      const res = await request(app)
        .post('/api/ai/followup')
        .set('Authorization', `Bearer ${token}`)
        .send({ company: '', role: '' });

      assert.equal(res.status, 400);
      assert.match(res.body.message, /required/i);
    });

    it('POST /api/ai/followup should generate a polite follow-up email draft', async () => {
      const res = await request(app)
        .post('/api/ai/followup')
        .set('Authorization', `Bearer ${token}`)
        .send({ company: 'Tesla', role: 'Autopilot Intern', status: 'Applied' });

      assert.equal(res.status, 200);
      assert.ok(res.body.message);
      assert.match(res.body.message, /Tesla/i);
      assert.match(res.body.message, /Autopilot Intern/i);
    });
  });
});

