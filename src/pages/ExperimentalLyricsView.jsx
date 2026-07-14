import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useExperimentalSession } from '../hooks/useExperimentalSession';

const ExperimentalLyricsView = () => {
  const { sessionId } = useParams();
  // Default to 'demo-session' if none provided
  const activeSessionId = sessionId || 'demo-session';

  const { songs, loading, error, updateSong, addSong } = useExperimentalSession(activeSessionId);

  const [mode, setMode] = useState('preview'); // 'preview', 'edit', 'performance'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Bulk Import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Dev Mode state
  const [showDevMode, setShowDevMode] = useState(false);
  const [devJsonText, setDevJsonText] = useState('');

  if (loading) return <div className="min-h-screen bg-[#0d1117] flex justify-center items-center text-white">Loading Setlist...</div>;
  if (error) return <div className="min-h-screen bg-[#0d1117] flex justify-center items-center text-red-500">Error: {error}</div>;
  if (!songs || songs.length === 0) return <div className="min-h-screen bg-[#0d1117] flex justify-center items-center text-white">No songs in setlist.</div>;

  const currentSong = songs[currentIndex] || songs[0];

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBulkImport(false);
      setShowDevMode(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowBulkImport(false);
      setShowDevMode(false);
    }
  };

  // Edit handlers for current song
  const handleHeaderChange = (e, field) => {
    updateSong(currentSong.id, { [field]: e.target.value });
  };

  const handleContentChange = (contentIndex, field, value) => {
    const newContent = [...currentSong.content];
    newContent[contentIndex][field] = value;
    updateSong(currentSong.id, { content: newContent });
  };

  const addContent = (type, atIndex = currentSong.content?.length || 0) => {
    const newContent = currentSong.content ? [...currentSong.content] : [];
    newContent.splice(atIndex, 0, { type, text: '', rightText: '' });
    updateSong(currentSong.id, { content: newContent });
  };

  const removeContent = (contentIndex) => {
    const newContent = [...currentSong.content];
    newContent.splice(contentIndex, 1);
    updateSong(currentSong.id, { content: newContent });
  };

  const moveContent = (contentIndex, direction) => {
    if (
      (direction === -1 && contentIndex === 0) || 
      (direction === 1 && contentIndex === currentSong.content.length - 1)
    ) return;

    const newContent = [...currentSong.content];
    const temp = newContent[contentIndex];
    newContent[contentIndex] = newContent[contentIndex + direction];
    newContent[contentIndex + direction] = temp;
    
    updateSong(currentSong.id, { content: newContent });
  };

  // Bulk Import Handlers
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const newContent = lines.map(line => ({
      type: 'lyric',
      text: line,
      rightText: ''
    }));

    updateSong(currentSong.id, { content: newContent });
    
    setBulkText('');
    setShowBulkImport(false);
  };

  // Dev Mode Import Handler
  const handleDevImport = async () => {
    try {
      const parsedData = JSON.parse(devJsonText);
      // Determine if we should update current song or add a new one
      if (parsedData.title && parsedData.content) {
        // We add a new song if they provide the full schema
        const newOrder = songs.length;
        await addSong({ ...parsedData, order: newOrder, number: newOrder + 1 });
        setCurrentIndex(songs.length); // jump to the new song
      } else if (Array.isArray(parsedData)) {
        // Assume they just pasted the `content` array for the current song
        await updateSong(currentSong.id, { content: parsedData });
      } else {
        alert("JSON must either be an array of content blocks OR an object with title and content array.");
        return;
      }
      setDevJsonText('');
      setShowDevMode(false);
    } catch (err) {
      alert("Invalid JSON format. Please check your syntax.");
    }
  };

  // --- RENDERING HELPERS ---

  const renderHeader = () => {
    if (!currentSong) return null;

    if (mode === 'performance') {
      return (
        <div className="flex justify-between items-baseline p-2">
           <h1 className="text-3xl font-bold">{currentSong.title}</h1>
           <div className="text-gray-400 text-lg flex gap-3">
             <span>{currentSong.key}</span>
             <span>{currentSong.timeSig}</span>
           </div>
        </div>
      );
    }

    if (mode === 'edit') {
      return (
        <div className="p-4 border-b border-gray-700 space-y-3 bg-[#1c2128]">
          <div className="text-teal-400 text-sm font-bold mb-1 uppercase tracking-wider flex justify-between items-center">
            <span>Editing Song {currentIndex + 1} of {songs.length}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => { setShowDevMode(!showDevMode); setShowBulkImport(false); }}
                className="text-xs bg-purple-900/50 border border-purple-700 text-purple-200 hover:bg-purple-800 px-2 py-1 rounded"
              >
                {showDevMode ? "Close Dev Mode" : "Dev Mode JSON"}
              </button>
              <button 
                onClick={() => { setShowBulkImport(!showBulkImport); setShowDevMode(false); }}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white"
              >
                {showBulkImport ? "Cancel Bulk Import" : "Bulk Import Lyrics"}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" value={currentSong.number || ''} 
              onChange={(e) => handleHeaderChange(e, 'number')}
              className="w-12 bg-gray-800 text-white p-1 rounded" placeholder="#"
            />
            <input 
              type="text" value={currentSong.title || ''} 
              onChange={(e) => handleHeaderChange(e, 'title')}
              className="flex-1 bg-gray-800 text-white p-1 rounded font-bold text-lg" placeholder="Title"
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="text" value={currentSong.key || ''} 
              onChange={(e) => handleHeaderChange(e, 'key')}
              className="w-1/2 bg-gray-800 text-white p-1 rounded text-sm" placeholder="Key (e.g. Dm)"
            />
            <input 
              type="text" value={currentSong.timeSig || ''} 
              onChange={(e) => handleHeaderChange(e, 'timeSig')}
              className="w-1/2 bg-gray-800 text-white p-1 rounded text-sm" placeholder="Time Sig (e.g. 4/4)"
            />
          </div>
        </div>
      );
    }

    // Default Preview Mode
    return (
      <div className="p-4 border-b border-gray-700 bg-[#1c2128]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-teal-400 text-xl font-bold">Setlist</h2>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">{currentIndex + 1} of {songs.length}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <h1 className="text-2xl font-bold">
            {currentSong.number}. {currentSong.title}
          </h1>
          <div className="text-gray-300 text-sm flex gap-3">
            <span>{currentSong.key}</span>
            <span>{currentSong.timeSig}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!currentSong) return null;

    if (mode === 'edit' && showDevMode) {
      return (
        <div className="p-4 space-y-4">
          <div className="text-sm text-purple-300 bg-purple-900/30 border border-purple-700/50 p-3 rounded">
            <strong>Developer Mode:</strong> Paste raw JSON here. You can paste an array of content blocks to update the current song's lyrics/cues, or paste a full JSON object (with `title`, `key`, `content` array) to add a <strong>brand new song</strong> to the setlist.
          </div>
          <textarea
            value={devJsonText}
            onChange={(e) => setDevJsonText(e.target.value)}
            className="w-full bg-gray-900 text-green-400 p-3 rounded min-h-[300px] border border-gray-700 font-mono text-sm whitespace-pre"
            placeholder={`[\n  { "type": "cue", "text": "Guitar Intro" },\n  { "type": "lyric", "text": "Hello world" }\n]`}
          />
          <button 
            onClick={handleDevImport}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded"
          >
            Import JSON
          </button>
        </div>
      );
    }

    if (mode === 'edit' && showBulkImport) {
      return (
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-400 bg-yellow-900/30 border border-yellow-700/50 p-3 rounded">
            <strong>Warning:</strong> Bulk importing will replace the current song's lyrics entirely. Paste your lyrics below, and each line will become a separate lyric block.
          </div>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="w-full bg-gray-900 text-white p-3 rounded min-h-[300px] border border-gray-700 font-mono text-sm"
            placeholder="Paste entire lyrics here..."
          />
          <button 
            onClick={handleBulkImport}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded"
          >
            Import and Split Lyrics
          </button>
        </div>
      );
    }

    const content = currentSong.content || [];

    return (
      <div className="p-4 space-y-2">
        {content.map((item, index) => {
          if (mode === 'edit') {
             return (
               <React.Fragment key={index}>
                 {/* Inline add cue button (appears above blocks) */}
                 <div className="flex justify-center -my-1 relative z-10 opacity-50 hover:opacity-100 transition-opacity mb-2">
                    <button 
                      onClick={() => addContent('cue', index)}
                      className="bg-red-900 text-red-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-red-700"
                    >
                      + Insert Cue
                    </button>
                 </div>

                 {/* The main editable block */}
                 <div className="flex flex-col gap-2 p-2 bg-gray-800 rounded border border-gray-600 mb-2">
                   <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                     <span>{item.type.toUpperCase()}</span>
                     <div className="flex gap-2">
                       <button onClick={() => moveContent(index, -1)} className="hover:text-white px-1">↑</button>
                       <button onClick={() => moveContent(index, 1)} className="hover:text-white px-1">↓</button>
                       <button onClick={() => removeContent(index)} className="hover:text-red-500 px-1">✕</button>
                     </div>
                   </div>
                   
                   <textarea 
                     value={item.text || ''} 
                     onChange={(e) => handleContentChange(index, 'text', e.target.value)}
                     className="w-full bg-gray-900 text-white p-2 rounded text-sm min-h-[60px]"
                     placeholder={item.type === 'cue' ? "Cue text..." : "Lyrics..."}
                   />
                   
                   {item.type === 'cue' && (
                     <input 
                       type="text" value={item.rightText || ''}
                       onChange={(e) => handleContentChange(index, 'rightText', e.target.value)}
                       className="w-full bg-gray-900 text-white p-2 rounded text-sm"
                       placeholder="Right-aligned cue text (optional)"
                     />
                   )}
                 </div>
               </React.Fragment>
             );
          }

          const isPerformance = mode === 'performance';
          
          if (item.type === 'cue') {
            return (
              <div key={index} className={`flex justify-between items-center text-red-500 font-medium pt-2 ${isPerformance ? 'text-[17px]' : 'text-[15px]'}`}>
                <span>{item.text}</span>
                {item.rightText && (
                  <span className="uppercase tracking-wider">{item.rightText}</span>
                )}
              </div>
            );
          } else if (item.type === 'lyric') {
            return (
              <div key={index} className={`text-gray-100 leading-relaxed ${isPerformance ? 'text-[20px] mb-3' : 'text-[17px]'}`}>
                {item.text}
              </div>
            );
          }
          return null;
        })}

        {mode === 'edit' && (
          <div className="flex gap-2 pt-4">
             <button onClick={() => addContent('lyric')} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm font-bold">
               + Add Lyric
             </button>
             <button onClick={() => addContent('cue')} className="flex-1 bg-red-900/50 hover:bg-red-800/50 text-red-200 border border-red-800 py-2 rounded text-sm font-bold">
               + Add Cue
             </button>
          </div>
        )}
      </div>
    );
  };

  const renderNavigation = () => {
    return (
      <div className={`p-4 flex gap-2 ${mode === 'performance' ? 'border-t border-gray-800' : 'bg-[#1c2128] border-t border-gray-700 rounded-b-xl'}`}>
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex-1 py-3 rounded-lg font-bold text-center transition-colors ${
            currentIndex === 0 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          PREV
        </button>
        <button 
          onClick={handleNext}
          disabled={currentIndex === songs.length - 1}
          className={`flex-1 py-3 rounded-lg font-bold text-center transition-colors ${
            currentIndex === songs.length - 1 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-teal-600 text-white hover:bg-teal-500'
          }`}
        >
          NEXT
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center p-4 font-sans text-white pb-20">
      
      {/* Mode Switcher */}
      <div className="w-full max-w-md flex bg-gray-800 rounded-lg p-1 mb-6 text-sm">
        <button 
          onClick={() => setMode('preview')} 
          className={`flex-1 py-2 rounded-md transition-colors ${mode === 'preview' ? 'bg-[#161b22] text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Preview
        </button>
        <button 
          onClick={() => setMode('edit')} 
          className={`flex-1 py-2 rounded-md transition-colors ${mode === 'edit' ? 'bg-[#161b22] text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Edit
        </button>
        <button 
          onClick={() => setMode('performance')} 
          className={`flex-1 py-2 rounded-md transition-colors ${mode === 'performance' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          Performance
        </button>
      </div>

      {/* Main Container */}
      <div className={`w-full max-w-md bg-[#161b22] overflow-hidden flex flex-col ${mode === 'performance' ? 'min-h-[70vh]' : 'rounded-xl border border-gray-700 shadow-lg'}`}>
        {renderHeader()}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
        {renderNavigation()}
      </div>
    </div>
  );
};

export default ExperimentalLyricsView;
