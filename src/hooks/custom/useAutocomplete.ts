import { useState, useMemo } from 'react';
import { universities } from '@/constants/universities';
import { searchCourses, allCourses } from '@/constants/courses';

export const useUniversities = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUniversities = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const lowerSearch = searchTerm.toLowerCase();
    return universities.filter(university =>
      university.toLowerCase().includes(lowerSearch)
    ).slice(0, 10); // Limitar a 10 resultados para performance
  }, [searchTerm]);

  const searchUniversities = (query: string) => {
    setSearchTerm(query);
  };

  return {
    universities: filteredUniversities,
    searchUniversities,
    searchTerm
  };
};

export const useCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCourses = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return searchCourses(searchTerm).slice(0, 10); // Limitar a 10 resultados
  }, [searchTerm]);

  const updateSearchTerm = (query: string) => {
    setSearchTerm(query);
  };

  return {
    courses: filteredCourses,
    searchCourses: updateSearchTerm,
    searchTerm
  };
};
