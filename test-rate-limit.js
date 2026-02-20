/**
 * Rate Limiting Test Script
 * 
 * This script tests the rate limiting implementation on authentication endpoints.
 * Run with: node test-rate-limit.js
 * 
 * Make sure your Next.js dev server is running on http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

// Helper to make requests
async function makeRequest(endpoint, body) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return {
            status: response.status,
            data,
            retryAfter: response.headers.get('Retry-After'),
        };
    } catch (error) {
        return {
            status: 'ERROR',
            error: error.message,
        };
    }
}

// Helper to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Login Rate Limiting (5 RPM)
async function testLoginRateLimit() {
    console.log('\n🧪 Testing Login Rate Limiting (5 RPM per IP)...');

    const testData = {
        email: 'test@example.com',
        password: 'password123',
    };

    let passedRequests = 0;
    let blockedRequests = 0;

    // Make 7 requests rapidly
    for (let i = 1; i <= 7; i++) {
        const result = await makeRequest('/api/auth/login', testData);

        if (result.status === 429) {
            console.log(`  ✅ Request ${i}: Blocked (429) - Retry after ${result.retryAfter}s`);
            blockedRequests++;
        } else if (result.status === 401 || result.status === 403) {
            // Expected for invalid credentials or unverified email
            console.log(`  ✅ Request ${i}: Passed rate limit (${result.status})`);
            passedRequests++;
        } else {
            console.log(`  ℹ️  Request ${i}: Status ${result.status}`);
            passedRequests++;
        }

        await wait(100); // Small delay between requests
    }

    if (passedRequests <= 5 && blockedRequests >= 2) {
        console.log('  ✅ PASS: Login rate limiting working correctly');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected ~5 passed and ~2 blocked, got ${passedRequests} passed and ${blockedRequests} blocked`);
        return false;
    }
}

// Test OTP/Reset Rate Limiting (3 RPM)
async function testOTPRateLimit() {
    console.log('\n🧪 Testing OTP/Reset Rate Limiting (3 RPM per IP)...');

    const testData = {
        email: 'test@example.com',
    };

    let passedRequests = 0;
    let blockedRequests = 0;

    // Make 5 requests rapidly
    for (let i = 1; i <= 5; i++) {
        const result = await makeRequest('/api/auth/forgot-password', testData);

        if (result.status === 429) {
            console.log(`  ✅ Request ${i}: Blocked (429) - Retry after ${result.retryAfter}s`);
            blockedRequests++;
        } else if (result.status === 200) {
            console.log(`  ✅ Request ${i}: Passed rate limit (200)`);
            passedRequests++;
        } else {
            console.log(`  ℹ️  Request ${i}: Status ${result.status}`);
            passedRequests++;
        }

        await wait(100);
    }

    if (passedRequests <= 3 && blockedRequests >= 2) {
        console.log('  ✅ PASS: OTP rate limiting working correctly');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected ~3 passed and ~2 blocked, got ${passedRequests} passed and ${blockedRequests} blocked`);
        return false;
    }
}

// Test Register Rate Limiting (5 RPM)
async function testRegisterRateLimit() {
    console.log('\n🧪 Testing Register Rate Limiting (5 RPM per IP)...');

    let passedRequests = 0;
    let blockedRequests = 0;

    // Make 7 requests rapidly
    for (let i = 1; i <= 7; i++) {
        const testData = {
            name: `Test User ${i}`,
            email: `test${i}@example.com`,
            password: 'password123',
            confirmPassword: 'password123',
        };

        const result = await makeRequest('/api/auth/register', testData);

        if (result.status === 429) {
            console.log(`  ✅ Request ${i}: Blocked (429) - Retry after ${result.retryAfter}s`);
            blockedRequests++;
        } else if (result.status === 201 || result.status === 400) {
            console.log(`  ✅ Request ${i}: Passed rate limit (${result.status})`);
            passedRequests++;
        } else {
            console.log(`  ℹ️  Request ${i}: Status ${result.status}`);
            passedRequests++;
        }

        await wait(100);
    }

    if (passedRequests <= 5 && blockedRequests >= 2) {
        console.log('  ✅ PASS: Register rate limiting working correctly');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected ~5 passed and ~2 blocked, got ${passedRequests} passed and ${blockedRequests} blocked`);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting Rate Limiting Tests');
    console.log('================================');
    console.log('Make sure your Next.js dev server is running!');

    const results = [];

    // Run tests with delays between each test suite
    results.push(await testLoginRateLimit());
    await wait(2000); // Wait 2 seconds between test suites

    results.push(await testOTPRateLimit());
    await wait(2000);

    results.push(await testRegisterRateLimit());

    // Summary
    console.log('\n================================');
    console.log('📊 Test Summary');
    console.log('================================');
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`Passed: ${passed}/${total}`);

    if (passed === total) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Review the output above.');
    }
}

// Run the tests
runTests().catch(console.error);
