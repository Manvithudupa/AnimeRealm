import React from "react";
import "./FilterCard.css";

const FilterCard = ({ anime }) => {
  if (!anime) return null;

  const { title, japanese_title, poster, tvInfo, adultContent } = anime;

  return (
    <div className="filter-card bg-gray-800 rounded overflow-hidden shadow-lg text-white">
      <img
        src={poster || "https://via.placeholder.com/300x400?text=No+Image"}
        alt={title || "Unknown Title"}
        className="w-full h-64 object-cover"
      />
      <div className="p-2">
        <h3 className="text-lg font-bold">{title?.slice(0, 25) || "Unknown Title"}</h3>
        <p className="text-sm text-gray-300">{japanese_title?.slice(0, 25) || ""}</p>
        <p className="text-sm mt-1">
          Type: {tvInfo?.showType || "Unknown"} | Duration: {tvInfo?.duration || "-"}
        </p>
        <p className="text-sm">
          Episodes: {tvInfo?.eps ?? "-"} | Sub: {tvInfo?.sub ?? 0} | Dub: {tvInfo?.dub ?? 0}
        </p>
        {adultContent && <p className="text-red-500 font-bold">18+</p>}
      </div>
    </div>
  );
};

export default FilterCard;
