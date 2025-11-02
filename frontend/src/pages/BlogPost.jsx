import React from 'react';
import { useParams } from 'react-router-dom';
import './BlogPost.css';

const BlogPost = () => {
  const { slug } = useParams();

  // Sample blog post data - in a real app, this would come from an API or database
  const blogPosts = {
    'breaking-down-medical-jargon': {
      title: 'Understanding Your Medical Records Matters',
      category: 'Health tech',
      author: 'Nicholas Davis, AG-ACNP',
      date: '10 Jan 2024',
      readTime: '7 min read',
      image: '/src/assets/ChatGPT Image Oct 4, 2025, 09_28_34 PM.png',
      content: {
        introduction: `If you've ever opened your medical records and felt confused, frustrated, or even anxious, you're not alone. As a clinician, I've watched countless patients try to make sense of long, complicated medical notes filled with abbreviations, numbers, and unfamiliar terminology. What should be empowering often feels overwhelming.

But here's the truth: understanding your medical records is one of the most powerful steps you can take to take control of your health. When you understand what's written about you, you become an active partner in your care, not just a bystander.`,
        sections: [
          {
            heading: 'Why Your Medical Records Matter',
            text: `Your medical record is essentially the story of your health. It includes your diagnoses, medications, allergies, test results, imaging studies, and doctors' notes. Every provider you see adds another chapter to that story. The challenge is that these notes are often written for other clinicians, not for patients. That means they're filled with shorthand, technical language, and assumptions that another healthcare professional would understand, but the average person wouldn't.

Here's why it matters:

• Better understanding = better decisions. When you know what's in your record, you can catch errors, clarify misunderstandings, and ask informed questions.

• It prevents duplicate tests and treatments. Patients who understand their history can share accurate information between specialists.

• It builds trust and confidence. Knowing what your doctor sees and writes helps you feel involved, not left out of the loop.`
          },
          {
            heading: 'How to Start Decoding Your Medical Records',
            text: `You don't need a medical degree to make sense of your records, just a few key strategies.

1. Start with your summaries and reports.
Look at discharge summaries, test results, and imaging reports first. These are usually the most structured and give a good overview. If something looks unfamiliar, underline it and write it down. Later, ask your doctor or search credible medical sources (like MedlinePlus or Mayo Clinic).

2. Learn a few common terms.
A few examples:
• HTN = Hypertension (high blood pressure)
• DM2 = Type 2 Diabetes Mellitus
• MI = Myocardial Infarction (heart attack)
• S/P = Status post (means "after" - for example, "S/P appendectomy" = you had your appendix removed)

Even learning a handful of these will make your next record review much easier.

3. Ask your clinician for context.
If something doesn't make sense, you have every right to ask. A good clinician should welcome your curiosity. Sometimes, what sounds serious in a note is actually routine, and asking clears up unnecessary worry.

4. Keep everything in one place.
Most of us see multiple providers - primary care, specialists, labs, hospitals - and each has its own system. Keeping your records unified (digitally or in print) helps your clinicians see the full picture and prevents missed information.`
          },
          {
            heading: 'The Problem With Jargon',
            text: `Medical language wasn't designed to exclude patients, but it often does. For example:

"The patient presents with dyspnea on exertion, secondary to chronic systolic heart failure."

To most people, that sounds alarming. Translated into plain English:

"You get short of breath when you're active because your heart isn't pumping as strongly as it should."

The meaning is the same, but one version is human, the other is hidden behind jargon. That's exactly the gap ClearChartAI is built to bridge.`
          },
          {
            heading: 'How AI Can Help',
            text: `Today, technology can help make sense of medical complexity. At ClearChartAI, we're developing tools that translate clinical language into plain, understandable summaries, giving you context, not confusion. Instead of pages of abbreviations and codes, you'll see clear explanations, definitions, and next steps written in language that makes sense.

Understanding your medical story shouldn't require years of medical training. It should be as simple as asking a question and getting an honest answer.`
          }
        ],
        quote: `"Understanding your medical records is one of the most powerful steps you can take to take control of your health. When you understand what's written about you, you become an active partner in your care, not just a bystander."`,
        conclusion: `When you understand your medical records, you understand yourself - your history, your progress, and your potential next steps. You become an informed partner in your care team.

So next time you open your records, don't be intimidated. Be curious. Highlight what you don't understand, ask questions, and know that the information written there belongs to you.

Because at the end of the day, your health data isn't just numbers or notes - it's your story. And you deserve to understand every word of it.`
      },
      tags: ['Health tech', 'Patient empowerment', 'AI innovation', 'Medical records']
    }
  };

  const post = blogPosts[slug] || blogPosts['breaking-down-medical-jargon'];

  return (
    <div className="blog-post-page">
      <div className="blog-post-header">
        <div className="breadcrumb">
          <a href="/blog">Blog</a> / <span>{post.category}</span>
        </div>
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-meta">
          <div className="author-info">
            <div className="author-avatar"></div>
            <div>
              <p className="author-name">{post.author}</p>
              <p className="post-date">{post.date} • {post.readTime}</p>
            </div>
          </div>
          <div className="share-buttons">
            <button className="share-btn" aria-label="Copy link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
            <button className="share-btn" aria-label="Share on LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
            <button className="share-btn" aria-label="Share on X">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button className="share-btn" aria-label="Share on Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="blog-post-content">
        <div className="hero-image">
          <img src={post.image} alt={post.title} />
        </div>

        <div className="content-section">
          <h2>Introduction</h2>
          <p>{post.content.introduction}</p>
        </div>

        <div className="image-placeholder">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" fill="#E5E5E5"/>
            <path d="M30 65L50 45L70 65M40 55L50 45L60 55" stroke="#999" strokeWidth="2"/>
          </svg>
          <p className="caption">Image caption goes here</p>
        </div>

        {post.content.sections.map((section, index) => (
          <div key={index} className="content-section">
            {section.heading && <h2>{section.heading}</h2>}
            <p>{section.text}</p>
          </div>
        ))}

        <blockquote className="quote">
          {post.content.quote}
        </blockquote>

        <div className="content-section">
          <p>{post.content.conclusion}</p>
        </div>

        <div className="content-section">
          <h2>Conclusion</h2>
          <p>{post.content.conclusion}</p>
        </div>

        <div className="post-footer">
          <div className="share-section">
            <h3>Share this post</h3>
            <div className="share-buttons-footer">
              <button className="share-btn-footer" aria-label="Copy link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              <button className="share-btn-footer" aria-label="Share on LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button className="share-btn-footer" aria-label="Share on X">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="share-btn-footer" aria-label="Share on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="tags">
            {post.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
