/**
 * Phase 1 Test Suite - Comprehensive API Testing
 * Tests all 4 endpoints with multiple scenarios
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds for Gemini calls
  validateStatus: () => true, // Don't throw on any status
});

interface TestResult {
  name: string;
  passed: boolean;
  statusCode: number;
  expectedCode: number;
  error?: string;
  responseSize?: number;
}

const results: TestResult[] = [];

// Helper to assert status code
async function testEndpoint(
  name: string,
  method: 'GET' | 'POST',
  path: string,
  data?: any,
  expectedStatus: number = 200
): Promise<TestResult> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📝 TEST: ${name}`);

  try {
    const response = await client({
      method,
      url: path,
      data,
    });

    const passed = response.status === expectedStatus;
    const result: TestResult = {
      name,
      passed,
      statusCode: response.status,
      expectedCode: expectedStatus,
      responseSize: JSON.stringify(response.data).length,
    };

    if (passed) {
      console.log(`✅ PASS - Status ${response.status}`);
      console.log(`📊 Response size: ${result.responseSize} bytes`);

      // Show response structure
      if (response.data?.data) {
        console.log(`📦 Data type: ${typeof response.data.data}`);
        if (Array.isArray(response.data.data)) {
          console.log(`📈 Items: ${response.data.data.length}`);
        }
      }
    } else {
      console.log(`❌ FAIL - Expected ${expectedStatus}, got ${response.status}`);
      console.log(`Error: ${response.data?.error || 'No error message'}`);
      result.error = response.data?.error;
    }

    results.push(result);
    return result;
  } catch (err: any) {
    const result: TestResult = {
      name,
      passed: false,
      statusCode: 0,
      expectedCode: expectedStatus,
      error: err.message,
    };
    console.log(`❌ ERROR - ${err.message}`);
    results.push(result);
    return result;
  }
}

// Main test suite
async function runTests() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   AI SOCIAL MEDIA AUTOMATION - PHASE 1 TEST SUITE        ║
╚═══════════════════════════════════════════════════════════╝
`);

  // Test 1: Health Check
  await testEndpoint('Health Check', 'GET', '/health', undefined, 200);

  // Test 2: Trending Topics
  await testEndpoint('Trending Topics', 'GET', '/trending', undefined, 200);

  // Test 3: Best Topic
  await testEndpoint('Best Topic Selection', 'GET', '/topic', undefined, 200);

  // Test 4: Generate with Auto Topic
  console.log('\n⏳ Next test will call Gemini API (20-45 seconds)...');
  await testEndpoint(
    'Generate Content (Auto Topic)',
    'POST',
    '/generate',
    {},
    200
  );

  // Test 5: Generate with Custom Topic
  console.log('\n⏳ Next test will call Gemini API (20-45 seconds)...');
  await testEndpoint(
    'Generate Content (Custom Topic)',
    'POST',
    '/generate',
    { topic: 'Quantum Computing Breakthrough' },
    200
  );

  // Test 6: Invalid endpoint
  await testEndpoint('Invalid Endpoint (404)', 'GET', '/invalid', undefined, 404);

  // Test 7: Invalid JSON
  try {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 TEST: Invalid JSON Payload`);

    const response = await axios.post(
      `${BASE_URL}/generate`,
      'invalid json',
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const passed = response.status === 400;
    const result: TestResult = {
      name: 'Invalid JSON Payload (400)',
      passed,
      statusCode: response.status,
      expectedCode: 400,
    };

    if (passed) {
      console.log(`✅ PASS - Status ${response.status}`);
    } else {
      console.log(`❌ FAIL - Expected 400, got ${response.status}`);
    }

    results.push(result);
  } catch (err: any) {
    const statusCode = err.response?.status || 0;
    const passed = statusCode === 400;
    const result: TestResult = {
      name: 'Invalid JSON Payload (400)',
      passed,
      statusCode,
      expectedCode: 400,
      error: err.response?.data?.error || err.message,
    };

    if (passed) {
      console.log(`✅ PASS - Status ${statusCode}`);
    } else {
      console.log(`❌ FAIL - Expected 400, got ${statusCode}`);
      console.log(`Error: ${result.error}`);
    }

    results.push(result);
  }

  // Print summary
  printSummary();
}

function printSummary() {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                          ║
╠═══════════════════════════════════════════════════════════╣
║ ✅ PASSED: ${passed.toString().padEnd(2)}                                        ║
║ ❌ FAILED: ${failed.toString().padEnd(2)}                                        ║
║ 📊 TOTAL:  ${results.length.toString().padEnd(2)}                                        ║
╚═══════════════════════════════════════════════════════════╝
`);

  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  results.forEach((r) => {
    const icon = r.passed ? '✅' : '❌';
    const status =
      r.statusCode > 0 ? `(${r.statusCode}/${r.expectedCode})` : '(no response)';
    console.log(`${icon} ${r.name.padEnd(35)} ${status}`);
    if (r.error) {
      console.log(`   └─ ${r.error}`);
    }
  });

  if (failed === 0) {
    console.log(
      '\n🎉 ALL TESTS PASSED! System is ready for Phase 2 integration.\n'
    );
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check errors above.\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
