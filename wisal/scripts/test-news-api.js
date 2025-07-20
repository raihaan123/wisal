const axios = require('axios');

async function testNewsCordAPI() {
  console.log('Testing NewsCord API integration...\n');
  
  try {
    const response = await axios.get('https://europe-west2-unbiased-reporting.cloudfunctions.net/get-aj', {
      params: {
        mode: '"all_pro_p"'
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Connection successful!');
    console.log(`📰 Total articles received: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('\n📋 Sample article structure:');
      const sampleArticle = response.data[0];
      console.log({
        date: sampleArticle.date ? '✅ Present' : '❌ Missing',
        headline: sampleArticle.headline ? '✅ Present' : '❌ Missing',
        image: sampleArticle.image ? '✅ Present' : '❌ Missing',
        logo: sampleArticle.logo ? '✅ Present' : '❌ Missing',
        source: sampleArticle.source ? '✅ Present' : '❌ Missing',
        text: sampleArticle.text ? '✅ Present' : '❌ Missing',
        url: sampleArticle.url ? '✅ Present' : '❌ Missing',
      });
      
      console.log('\n📰 First 3 articles:');
      response.data.slice(0, 3).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.headline}`);
        console.log(`   Source: ${article.source}`);
        console.log(`   Date: ${article.date}`);
        console.log(`   URL: ${article.url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testNewsCordAPI();