-- Seed data for Documents Management System
-- Run with: psql <connection-string> -f prisma/seed.sql

DO $$
DECLARE
  id_projects       INT;
  id_finance        INT;
  id_hr             INT;
  id_website        INT;
  id_mobile         INT;
  id_assets         INT;
  id_invoices       INT;
  id_onboarding     INT;
BEGIN

  -- ─── Root level ───────────────────────────────────────────────────────────

  INSERT INTO items (name, type, created_by, updated_at)
    VALUES ('Projects', 'folder', 'John Green', NOW())
    RETURNING id INTO id_projects;

  INSERT INTO items (name, type, created_by, updated_at)
    VALUES ('Finance', 'folder', 'Sarah Connor', NOW())
    RETURNING id INTO id_finance;

  INSERT INTO items (name, type, created_by, updated_at)
    VALUES ('HR', 'folder', 'Bob Smith', NOW())
    RETURNING id INTO id_hr;

  INSERT INTO items (name, type, mime_type, size, created_by, updated_at) VALUES
    ('Company Overview',  'document', 'application/pdf',                                                                    2097152,  'John Green',   NOW()),
    ('Meeting Notes',     'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',            524288,   'Sarah Connor', NOW()),
    ('Org Chart',         'document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',                 1048576,  'Bob Smith',    NOW());

  -- ─── Projects ─────────────────────────────────────────────────────────────

  INSERT INTO items (name, type, parent_id, created_by, updated_at)
    VALUES ('Website Redesign', 'folder', id_projects, 'John Green', NOW())
    RETURNING id INTO id_website;

  INSERT INTO items (name, type, parent_id, created_by, updated_at)
    VALUES ('Mobile App', 'folder', id_projects, 'Alice Wang', NOW())
    RETURNING id INTO id_mobile;

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('Project Roadmap',   'document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 307200,  id_projects, 'John Green', NOW()),
    ('Stakeholder Brief', 'document', 'application/pdf',                                                   819200,  id_projects, 'Alice Wang', NOW());

  -- ─── Projects / Website Redesign ──────────────────────────────────────────

  INSERT INTO items (name, type, parent_id, created_by, updated_at)
    VALUES ('Assets', 'folder', id_website, 'John Green', NOW())
    RETURNING id INTO id_assets;

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('Design Mockups',  'document', 'application/pdf',                                                                   4194304,  id_website, 'John Green',   NOW()),
    ('Requirements',    'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',           204800,   id_website, 'Sarah Connor', NOW()),
    ('Style Guide',     'document', 'application/pdf',                                                                   1572864,  id_website, 'Alice Wang',   NOW());

  -- ─── Projects / Website Redesign / Assets ─────────────────────────────────

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('Logo',            'document', 'image/png',  512000,  id_assets, 'John Green', NOW()),
    ('Banner',          'document', 'image/png',  768000,  id_assets, 'John Green', NOW()),
    ('Icons Pack',      'document', 'image/png',  102400,  id_assets, 'Alice Wang', NOW());

  -- ─── Projects / Mobile App ────────────────────────────────────────────────

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('App Spec',        'document', 'application/pdf',                                                                   2621440,  id_mobile, 'Alice Wang',   NOW()),
    ('UI Wireframes',   'document', 'application/pdf',                                                                   3145728,  id_mobile, 'John Green',   NOW()),
    ('API Contracts',   'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',           409600,   id_mobile, 'Sarah Connor', NOW());

  -- ─── Finance ──────────────────────────────────────────────────────────────

  INSERT INTO items (name, type, parent_id, created_by, updated_at)
    VALUES ('Invoices', 'folder', id_finance, 'Sarah Connor', NOW())
    RETURNING id INTO id_invoices;

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('Q1 2025 Report',  'document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 1048576,  id_finance, 'Sarah Connor', NOW()),
    ('Q2 2025 Report',  'document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 1048576,  id_finance, 'Sarah Connor', NOW()),
    ('Budget 2025',     'document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 720896,   id_finance, 'Bob Smith',    NOW()),
    ('Audit Report',    'document', 'application/pdf',                                                   2097152,  id_finance, 'Bob Smith',    NOW());

  -- ─── Finance / Invoices ───────────────────────────────────────────────────

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('Invoice 001',     'document', 'application/pdf', 102400,  id_invoices, 'Sarah Connor', NOW()),
    ('Invoice 002',     'document', 'application/pdf', 102400,  id_invoices, 'Sarah Connor', NOW()),
    ('Invoice 003',     'document', 'application/pdf', 98304,   id_invoices, 'Bob Smith',    NOW()),
    ('Invoice 004',     'document', 'application/pdf', 110592,  id_invoices, 'Bob Smith',    NOW());

  -- ─── HR ───────────────────────────────────────────────────────────────────

  INSERT INTO items (name, type, parent_id, created_by, updated_at)
    VALUES ('Onboarding', 'folder', id_hr, 'Bob Smith', NOW())
    RETURNING id INTO id_onboarding;

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('Employee Handbook',   'document', 'application/pdf',                                                                 3670016,  id_hr, 'Bob Smith',    NOW()),
    ('Leave Policy',        'document', 'application/pdf',                                                                 512000,   id_hr, 'Sarah Connor', NOW()),
    ('Benefits Summary',    'document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',              409600,   id_hr, 'Bob Smith',    NOW());

  -- ─── HR / Onboarding ─────────────────────────────────────────────────────

  INSERT INTO items (name, type, mime_type, size, parent_id, created_by, updated_at) VALUES
    ('Welcome Guide',       'document', 'application/pdf',                                                                 1048576,  id_onboarding, 'Bob Smith',    NOW()),
    ('IT Setup Checklist',  'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',         204800,   id_onboarding, 'Sarah Connor', NOW()),
    ('Security Policy',     'document', 'application/pdf',                                                                 307200,   id_onboarding, 'Bob Smith',    NOW());

END $$;
