const fetch = require('node-fetch');

const API_URL = 'https://chatgpt.org.ua/api/?action=add_question';
const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Build/QKQ1.190910.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.188 Mobile Safari/537.36'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const prompt = req.query.isi || 'hi';
    const body = `question=${encodeURIComponent(prompt)}&bfp_hash=277174405&bfp_data=XQXlTObQmSIntcImFwcENvZGVOYW1lXCI6XCJNb3ppbGxhXCIsXCJhcHBOYW1lXCI6XCJOZXRzY2FwZVwiLFwiYXBwVmVyc2lvblwiOlwiNS4wIChMaW51eDsgQW5kcm9pZCAxMDsgUmVkbWkgTm90ZSA3IEJ1aWxkL1FLUTEuMTkwOTEwLjAwMikgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyNi4wLjY0NzguMTg4IE1vYmlsZSBTYWZhcmkvNTM3LjM2XCIsXCJjYW52YXNcIjo4NDUzNTk1NDgsXCJjb2xvckRlcHRoXCI6MjQsXCJjb29raWVFbmFibGVkXCI6dHJ1ZSxcImRldmljZU1lbW9yeVwiOjQsXCJkZXZpY2VQaXhlbFJhdGlvXCI6MixcImRvTm90VHJhY2tcIjpudWxsLFwiaGFyZHdhcmVDb25jdXJyZW5jeVwiOjgsXCJoZWlnaHRcIjo4NTEsXCJsYW5ndWFnZVwiOlwiaWQtSURcIixcImxhbmd1YWdlc1wiOltcImlkLUlEXCIsXCJlbi1VU1wiXSxcIm1heFRvdWNoUG9pbnRzXCI6NSxcInBpeGVsRGVwdGhcIjoyNCxcInBsYXRmb3JtXCI6XCJMaW51eCBhYXJjaDY0XCIsXCJwcm9kdWN0XCI6XCJHZWNrb1wiLFwicHJvZHVjdFN1YlwiOlwiMjAwMzAxMDdcIixcInRpbWV6b25lXCI6XCJBc2lhL0pha2FydGFcIixcInRpbWV6b25lT2Zmc2V0XCI6LTQyMCxcInRvdWNoU3VwcG9ydFwiOnRydWUsXCJ1c2VyQWdlbnRcIjpcIk1vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCAxMDsgUmVkbWkgTm90ZSA3IEJ1aWxkL1FLUTEuMTkwOTEwLjAwMikgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyNi4wLjY0NzguMTg4IE1vYmlsZSBTYWZhcmkvNTM3LjM2XCIsXCJ2ZW5kb3JcIjpcIkdvb2dsZSBJbmMuXCIsXCJ2ZW5kb3JTdWJcIjpcIlwiLFwid2ViZ2xcIjoxMjQ1NzU1MDM0LFwid2ViZ2xJbmZvXCI6e1wiVkVSU0lPTlwiOlwiV2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKVwiLFwiU0hBRElOR19MQU5HVUFHRV9WRVJTSU9OXCI6XCJXZWJHTCBHTFNMIEVTIDEuMCAoT3BlbkdMIEVTIEdMU0wgRVMgMS4wIENocm9taXVtKVwiLFwiVkVORE9SXCI6XCJXZWJLaXRcIixcIlNVUE9SVEVEX0VYVEVOU0lPTlNcIjpbXCJBTkdMRV9pbnN0YW5jZWRfYXJyYXlzXCIsXCJFWFRfYmxlbmRfbWlubWF4XCIsXCJFWFRfY29sb3JfYnVmZmVyX2hhbGZfZmxvYXRcIixcIkVYVF9mbG9hdF9ibGVuZFwiLFwiRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXCIsXCJFWFRfc1JHQlwiLFwiT0VTX2VsZW1lbnRfaW5kZXhfdWludFwiLFwiT0VTX2Zib19yZW5kZXJfbWlwbWFwXCIsXCJPRVNfc3RhbmRhcmRfZGVyaXZhdGl2ZXNcIixcIk9FU190ZXh0dXJlX2Zsb2F0XCIsXCJPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXJcIixcIk9FU190ZXh0dXJlX2hhbGZfZmxvYXRcIixcIk9FU190ZXh0dXJlX2hhbGZfZmxvYXRfbGluZWFyXCIsXCJPRVNfdmVydGV4X2FycmF5X29iamVjdFwiLFwiV0VCR0xfY29sb3JfYnVmZmVyX2Zsb2F0XCIsXCJXRUJHTF9jb21wcmVzc2VkX3RleHR1cmVfYXN0Y1wiLFwiV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2V0Y1wiLFwiV0VCR0xfY29tcHJlc3NlZF90ZXh0dXJlX2V0YzFcIixcIldFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm9cIixcIldFQkdMX2RlYnVnX3NoYWRlcnNcIixcIldFQkdMX2RlcHRoX3RleHR1cmVcIixcIldFQkdMX2xvc2VfY29udGV4dFwiLFwiV0VCR0xfbXVsdGlfZHJhd1wiXX0sXCJ3aWR0aFwiOjM5M30ifUCsDu2ZVm&ip=103.30.11.154&client_token=UljdP0yvivhhi2mxD20e4X5kEXntvyWJ`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: HEADERS,
      body
    });

    const data = await response.json();
    const replyData = data.data || 'No data received';

    res.status(200).send(replyData);

  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
};
