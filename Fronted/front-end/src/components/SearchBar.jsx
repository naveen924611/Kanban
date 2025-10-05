import React, { useState } from 'react';
import { searchCards } from '../services/api';
import './SearchBar.css';

function SearchBar({ boardId, onSearch }) {
  const [query, setQuery] = useState('');
  const [label, setLabel] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      const params = {};
      if (query) params.q = query;
      if (label) params.label = label;
      
      const res = await searchCards(boardId, params);
      onSearch(res.data);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleClear = () => {
    setQuery('');
    setLabel('');
    onSearch([]);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cards..."
          className="search-input"
        />
        <button type="submit" className="search-btn">🔍</button>
        {/* <button 
          type="button" 
          onClick={() => setShowFilters(!showFilters)}
          className="filter-btn"
        >
          settings
        </button> */}
      </form>

      {showFilters && (
        <div className="filters-dropdown">
          <div className="filter-group">
            <label>Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Filter by label"
            />
          </div>
          <button onClick={handleClear} className="btn-clear">Clear Filters</button>
        </div>
      )}
    </div>
  );
}

export default SearchBar;