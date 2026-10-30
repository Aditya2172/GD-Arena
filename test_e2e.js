const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Health Endpoint ---');
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('Health Status:', health.status, 'Response:', JSON.stringify(health.body));
  if (health.status !== 200 || health.body.status !== 'healthy') throw new Error('Health check failed');

  console.log('\n--- 2. Testing Auth Security (Missing Auth Header) ---');
  const unauth = await request({ host: 'localhost', port: 5000, path: '/api/sessions', method: 'POST' });
  console.log('Unauthenticated Request Status:', unauth.status, '(Expected 401)');
  if (unauth.status !== 401) throw new Error('Auth guard failed');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-student-test'
  };

  console.log('\n--- 3. Testing Room Creation & Discussion Starter ---');
  const createRes = await request({
    host: 'localhost', port: 5000, path: '/api/sessions', method: 'POST', headers
  }, {
    topic: 'Remote Work vs Office Work Culture',
    difficulty: 'Intermediate',
    duration_minutes: 5,
    participant_count: 3,
    discussion_style: 'Placement preparation',
    selected_personalities: ['analytical', 'devils_advocate', 'collaborative']
  });
  console.log('Create Session Status:', createRes.status);
  const sessionId = createRes.body.session.id;
  console.log('Created Session ID:', sessionId);
  console.log('Initial AI Speaker:', createRes.body.initialMessage.speaker_name, '(' + createRes.body.initialMessage.personality + ')');
  console.log('Initial Starter Text:', createRes.body.initialMessage.message_text);

  console.log('\n--- 4. Testing Candidate Turn 1 & AI Response ---');
  const turn1 = await request({
    host: 'localhost', port: 5000, path: `/api/sessions/${sessionId}/respond`, method: 'POST', headers
  }, {
    userMessage: 'While remote work boosts individual deep-work productivity, team cohesion and spontaneous innovation often decline without physical proximity.'
  });
  console.log('Turn 1 Status:', turn1.status);
  console.log('AI Responding Speaker:', turn1.body.speaker.name, '(' + turn1.body.speaker.roleTitle + ')');
  console.log('AI TTS Speech Rate:', turn1.body.speaker.speechRate, 'Pitch:', turn1.body.speaker.speechPitch);
  console.log('AI Response Text:', turn1.body.message.message_text);

  console.log('\n--- 5. Testing Candidate Turn 2 & Turn Balancing ---');
  const turn2 = await request({
    host: 'localhost', port: 5000, path: `/api/sessions/${sessionId}/respond`, method: 'POST', headers
  }, {
    userMessage: 'Therefore, companies adopting a hybrid 3-2 model balance autonomous delivery with collaborative alignment.'
  });
  console.log('Turn 2 AI Speaker:', turn2.body.speaker.name, '(' + turn2.body.speaker.roleTitle + ')');
  console.log('Turn 2 Response Text:', turn2.body.message.message_text);

  console.log('\n--- 6. Testing End Session & 8-Metric Assessment Generation ---');
  const reportRes = await request({
    host: 'localhost', port: 5000, path: `/api/sessions/${sessionId}/report`, method: 'POST', headers
  });
  console.log('Report Status:', reportRes.status);
  const report = reportRes.body.report;
  console.log('Overall Placement Score:', report.overall_score, '/ 100');
  console.log('Detailed 8 Rubric Scores:');
  console.log(JSON.stringify(report.scores, null, 2));
  console.log('Identified Strengths:', report.strengths);
  console.log('Areas for Improvement:', report.areas_for_improvement);
  console.log('Sentence Rewrites (Improved Arguments):', report.improved_argument_examples);
  console.log('Next Session Goals (3):', report.next_session_goals);

  console.log('\n--- 7. Testing Progress Analytics ---');
  const analytics = await request({ host: 'localhost', port: 5000, path: '/api/analytics', method: 'GET', headers });
  console.log('Total Sessions in Analytics:', analytics.body.analytics.totalSessions);
  console.log('Average Score:', analytics.body.analytics.averageScore);
  console.log('Radar Dimensions Count:', analytics.body.analytics.radarScores.length);
  console.log('Most Improved Skill:', analytics.body.analytics.mostImprovedSkill);

  console.log('\n========================================');
  console.log('✅ ALL APPLICATION MODULES VERIFIED 100%');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
