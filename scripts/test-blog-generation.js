#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('🚀 Test script starting...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📁 Current directory:', __dirname);

const sampleBrief = {
  title: "10 Unique Gift Ideas for Tech-Savvy Parents",
  audience: "Adults looking for gifts for their tech-loving parents",
  goal: "Inform and provide actionable gift recommendations",
  primaryKeyword: "tech gifts for parents",
  secondaryKeywords: ["smart home gifts", "digital wellness", "parent technology"],
  tone: "Friendly and helpful",
  outline: [
    "Introduction to tech gifts for parents",
    "Smart home devices",
    "Digital wellness tools",
    "Entertainment gadgets",
    "Conclusion and recommendations"
  ],
  references: [
    "https://www.consumerreports.org/electronics-computers/smart-home-devices/",
    "https://www.techradar.com/best/best-smart-home-devices"
  ],
  notes: "Focus on user-friendly devices that won't overwhelm parents",
  featuredImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop"
};

async function testBlogGeneration() {
  console.log('🧪 Starting Blog Generation Test...\n');
  
  try {
    // Test 1: Check if configuration files exist
    console.log('📁 Checking configuration files...');
    const configFiles = [
      'config/chatgpt_params.json',
      'templates/editorial_brief.md',
      'templates/blog_prompt.txt',
      'content/human_first_seo_rules.md',
      'content/humanization_checklist.md',
      'content/seo_publish_checklist.md'
    ];
    
    for (const file of configFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        return false;
      }
    }
    
    // Test 2: Validate ChatGPT parameters
    console.log('\n🔧 Validating ChatGPT parameters...');
    const paramsPath = path.join(__dirname, '..', 'config/chatgpt_params.json');
    const params = JSON.parse(fs.readFileSync(paramsPath, 'utf8'));
    
    const requiredParams = ['model', 'temperature', 'top_p', 'frequency_penalty', 'presence_penalty', 'max_tokens'];
    for (const param of requiredParams) {
      if (params[param] !== undefined) {
        console.log(`✅ ${param}: ${params[param]}`);
      } else {
        console.log(`❌ Missing parameter: ${param}`);
        return false;
      }
    }
    
    // Test 3: Check OpenAI API key
    console.log('\n🔑 Checking OpenAI API key...');
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ OPENAI_API_KEY environment variable not set');
      console.log('💡 Set it with: export OPENAI_API_KEY="your-api-key"');
      return false;
    }
    console.log('✅ OPENAI_API_KEY is set');
    
    // Test 4: Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('http://localhost:3000/api/save-to-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleBrief)
    });
    
    if (!response.ok) {
      console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`Error details: ${errorText}`);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ API request successful');
    console.log(`📄 File saved: ${result.filePath}`);
    console.log(`⚠️  Warnings: ${result.warnings?.length || 0}`);
    console.log(`📝 WordPress published: ${result.wordpressPublished || false}`);
    
    // Test 5: Check if file was created
    console.log('\n📂 Checking if file was created...');
    if (result.filePath) {
      const filePath = path.join(__dirname, '..', result.filePath);
      if (fs.existsSync(filePath)) {
        console.log('✅ Blog post file created successfully');
        
        // Test 6: Validate file structure
        console.log('\n📋 Validating file structure...');
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for YAML frontmatter
        if (content.startsWith('---')) {
          console.log('✅ YAML frontmatter found');
          
          // Extract frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const requiredFields = ['title', 'slug', 'date', 'description'];
            
            for (const field of requiredFields) {
              if (frontmatter.includes(`${field}:`)) {
                console.log(`✅ ${field} field present`);
              } else {
                console.log(`❌ Missing ${field} field`);
              }
            }
          }
        } else {
          console.log('❌ YAML frontmatter missing');
        }
        
        // Test 7: Check content quality indicators
        console.log('\n📊 Checking content quality...');
        const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---/, '').trim();
        
        // Check for keyword usage
        if (contentWithoutFrontmatter.toLowerCase().includes('tech gifts for parents')) {
          console.log('✅ Primary keyword found in content');
        } else {
          console.log('⚠️  Primary keyword not found in content');
        }
        
        // Check for contractions (humanization)
        const contractions = contentWithoutFrontmatter.match(/\b(you're|don't|it's|we're|they're|can't|won't|isn't|aren't)\b/gi);
        if (contractions && contractions.length > 0) {
          console.log(`✅ Found ${contractions.length} contractions (good for humanization)`);
        } else {
          console.log('⚠️  No contractions found (may need humanization)');
        }
        
        // Check for repetitive phrases
        const repetitivePhrases = ['In conclusion', 'Overall', 'Moreover', 'Furthermore'];
        const foundRepetitive = repetitivePhrases.filter(phrase => 
          contentWithoutFrontmatter.includes(phrase)
        );
        if (foundRepetitive.length === 0) {
          console.log('✅ No repetitive AI phrases found');
        } else {
          console.log(`⚠️  Found repetitive phrases: ${foundRepetitive.join(', ')}`);
        }
        
        // Check paragraph structure
        const paragraphs = contentWithoutFrontmatter.split('\n\n').filter(p => p.trim().length > 0);
        console.log(`✅ Content has ${paragraphs.length} paragraphs`);
        
      } else {
        console.log('❌ Blog post file not found');
        return false;
      }
    } else {
      console.log('❌ No file path returned from API');
      return false;
    }
    
    console.log('\n🎉 All tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    return false;
  }
}

console.log('🎯 Script loaded, checking if running directly...');

if (process.argv[1].endsWith('test-blog-generation.js')) {
  console.log('✅ Running as main script, starting tests...');
  testBlogGeneration()
    .then(success => {
      if (success) {
        console.log('\n🎯 Blog generation system is working correctly!');
        process.exit(0);
      } else {
        console.log('\n💥 Blog generation system has issues that need to be fixed.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test script failed:', error);
      process.exit(1);
    });
} else {
  console.log('📦 Script imported as module');
}

export { testBlogGeneration, sampleBrief };
