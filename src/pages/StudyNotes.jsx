import React, { useState, useEffect } from 'react';

const StudyNotes = () => {
  const [notesData, setNotesData] = useState(null);

  useEffect(() => {
    const cachedNotes = localStorage.getItem('lumina_structured_notes');
    if (cachedNotes) {
      setNotesData(JSON.parse(cachedNotes));
    }
  }, []);

  const handleScrollToTopic = (e) => {
    const topicIndex = e.target.value;
    if (topicIndex !== "") {
      const el = document.getElementById(`topic-${topicIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="page-container fade-in dashboard-layout">
      <div className="page-header">
        <h1>Study Notes</h1>
      </div>

      {!notesData ? (
        <div className="glass-panel empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any generated notes yet. Go to the Generator Hub to parse a document!</p>
        </div>
      ) : (
        <>
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2>{notesData.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.6' }}>{notesData.summary}</p>
          </section>

          <section className="topics-section" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Core Topics</h2>
              {notesData.topics && notesData.topics.length > 0 && (
                <select className="modern-input" style={{ width: '250px', padding: '8px 12px' }} onChange={handleScrollToTopic} defaultValue="">
                  <option value="" disabled>Jump to topic...</option>
                  {notesData.topics.map((topic, index) => (
                    <option key={index} value={index}>{topic.title}</option>
                  ))}
                </select>
              )}
            </div>
            
            {notesData.topics && notesData.topics.map((topic, index) => (
              <div key={index} id={`topic-${index}`} className="glass-panel" style={{ padding: '2rem', marginTop: '1rem', scrollMarginTop: '80px' }}>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.4rem' }}>{topic.title}</h3>
                {topic.takeaway && <p style={{ fontStyle: 'italic', margin: '1rem 0', color: 'var(--text-secondary)' }}>💡 {topic.takeaway}</p>}
                
                <div style={{ marginTop: '1.5rem' }}>
                  {topic.details.map((detail, dIdx) => (
                    <div key={dIdx} style={{ marginBottom: '1.5rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{detail.name}</strong>
                      <ul style={{ marginLeft: '1.5rem', marginTop: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                        {detail.description?.map((pt, ptIdx) => (
                          <li key={ptIdx} style={{ marginBottom: '0.4rem' }}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default StudyNotes;
