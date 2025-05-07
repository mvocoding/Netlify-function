const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();
const axios = require('axios');
const cors = require('cors');

app.use(cors());


let records = [];

//Get all students
router.get('/', (req, res) => {
  res.send('App is running..');
});

//Create new record
router.post('/add', (req, res) => {
  res.send('New record added.');
});

//delete existing record
router.delete('/', (req, res) => {
  res.send('Deleted existing record');
});

//updating existing record
router.put('/', (req, res) => {
  res.send('Updating existing record');
});

//showing demo records
router.get('/demo', (req, res) => {
  res.json([
    {
      id: '001',
      name: 'Smith',
      email: 'smith@gmail.com',
    },
    {
      id: '002',
      name: 'Sam',
      email: 'sam@gmail.com',
    },
    {
      id: '003',
      name: 'lily',
      email: 'lily@gmail.com',
    },
  ]);
});

router.get('/live-projects', async (req, res) => {
  try {
    const username = 'maxvo_dev';
    const MAX_ITEMS = 6;
    const input = { '0': { json: { username } } };
    const encodedInput = encodeURIComponent(JSON.stringify(input));

    const url1 = `https://icodethis.com/api/trpc/user.getUserSubmissions,user.getUserBadges?batch=1&input=${encodedInput}`;
    const response1 = await axios.get(url1);
    const data1 = response1.data;

    const projects = data1?.[0]?.result?.data?.json?.modes_submission?.slice(0, MAX_ITEMS) || [];

    const result = await Promise.all(projects.map(async (project) => {
      const { href, id, title, img_url, mode: { id: projectID } } = project;

      const input2 = { '0': { json: { id: projectID } } };
      const encodedInput2 = encodeURIComponent(JSON.stringify(input2));
      const url2 = `https://icodethis.com/api/trpc/designToCode.getChallenge,designToCode.getSubmissionByChallengeId?batch=1&input=${encodedInput2}`;

      const response2 = await axios.get(url2);
      const challengeData = response2.data;
      const challengeImg = challengeData[0]?.result?.data?.json?.meta?.image;
      const defaultImg = `https://icodethis.com/images/projects/${challengeImg}`;
      const imgSrc = img_url
        ? `https://shismqklzntzxworibfn.supabase.co/storage/v1/object/public/previews/${img_url}`
        : defaultImg;

      return { href, id, title, imgSrc };
    }));

    res.json(result);
  } catch (err) {
    console.error('Error in server:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
