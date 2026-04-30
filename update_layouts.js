const fs = require('fs');

const files = [
  'src/app/dashboard/trainer/1rm/page.tsx',
  'src/app/dashboard/trainer/ai/page.tsx',
  'src/app/dashboard/trainer/billing/page.tsx',
  'src/app/dashboard/trainer/bmi/page.tsx',
  'src/app/dashboard/trainer/calendar/page.tsx',
  'src/app/dashboard/trainer/clients/[clientId]/page.tsx',
  'src/app/dashboard/trainer/enroll/page.tsx',
  'src/app/dashboard/trainer/meals/page.tsx',
  'src/app/dashboard/trainer/messages/page.tsx',
  'src/app/dashboard/trainer/profile/meals/page.tsx',
  'src/app/dashboard/trainer/profile/page.tsx',
  'src/app/dashboard/trainer/profile/supps/page.tsx',
  'src/app/dashboard/trainer/profile/workout/page.tsx',
  'src/app/dashboard/trainer/status/page.tsx',
  'src/app/dashboard/trainer/workouts/page.tsx',
  'src/app/dashboard/client/1rm/page.tsx',
  'src/app/dashboard/client/calendar/page.tsx',
  'src/app/dashboard/client/goals/page.tsx',
  'src/app/dashboard/client/meals/page.tsx',
  'src/app/dashboard/client/messages/page.tsx',
  'src/app/dashboard/client/photos/page.tsx',
  'src/app/dashboard/client/supplements/page.tsx',
  'src/app/dashboard/client/workout/page.tsx',
];

files.forEach(file => {
  if (!fs.existsSync(file)) { console.log('MISSING:', file); return; }
  let c = fs.readFileSync(file, 'utf8');
  
  if (!c.includes('<DashboardLayout')) { console.log('SKIP:', file); return; }

  // Replace </div> that closes DashboardLayout with </DashboardLayout>
  // It's the last </div> before );\n}
  const endPattern = /(<\/(?:main|div)>)\s*\n(\s*\);\s*\n\})/;
  if (endPattern.test(c)) {
    c = c.replace(endPattern, '</DashboardLayout>\n$2');
    fs.writeFileSync(file, c);
    console.log('FIXED:', file);
  } else {
    console.log('PATTERN NOT FOUND:', file);
  }
});

console.log('\nDone.');