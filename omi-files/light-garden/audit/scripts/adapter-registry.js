#!/usr/bin/env node
const features = require('../features');

function normalizeCapability(cap) {
  return {
    capability: cap.id,
    name: cap.name,
    severity: cap.severity,
    nodes: Array.isArray(cap.nodes) ? [...cap.nodes] : [],
    tests: cap.tests || { golden: 0, negative: 0 },
    total_tests: Number((cap.tests && cap.tests.golden) || 0) + Number((cap.tests && cap.tests.negative) || 0)
  };
}

function listAdapters() {
  return [...features.capabilities]
    .map(normalizeCapability)
    .sort((a, b) => a.capability.localeCompare(b.capability));
}

function getCoverageAll() {
  const adapters = listAdapters();
  const bySeverity = {};
  for (const a of adapters) {
    bySeverity[a.severity] = bySeverity[a.severity] || { capabilities: 0, total_tests: 0 };
    bySeverity[a.severity].capabilities += 1;
    bySeverity[a.severity].total_tests += a.total_tests;
  }
  return {
    version: features.version,
    adapter_count: adapters.length,
    total_tests: adapters.reduce((n, a) => n + a.total_tests, 0),
    by_severity: bySeverity,
    adapters
  };
}

function filterBy({ severity, nodes, capability } = {}) {
  let adapters = listAdapters();
  if (severity) adapters = adapters.filter((a) => a.severity === severity);
  if (capability) adapters = adapters.filter((a) => a.capability === capability);
  if (nodes && nodes.length) {
    const want = Array.isArray(nodes) ? nodes : [nodes];
    adapters = adapters.filter((a) => want.every((n) => a.nodes.includes(n)));
  }
  return adapters;
}

module.exports = {
  listAdapters,
  getCoverageAll,
  filterBy
};
