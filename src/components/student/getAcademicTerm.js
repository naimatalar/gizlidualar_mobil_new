import React from 'react';
import LangApp from '../Language';

function getAcademicTerm(props) {
    const term=props.user.academicYear+" "+LangApp("Seasson_"+props.user.academicTerm)
    return (
      term
    );
}

export default getAcademicTerm;