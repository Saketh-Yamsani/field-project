// SearchBar.js
import React from "react";

function SearchBar({ searchTerm, setSearchTerm }) {
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="mb-3">
            <input
                type="text"
                className="form-control"
                placeholder="Search by name or other fields"
                value={searchTerm}
                onChange={handleSearch}
            />
        </div>
    );
}

export default SearchBar;
