import React, { useEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useTaxReturn, type PersonId } from '../../context/TaxReturnContext';

const REVIEW_STEPS = new Set(['review']);
const SUBMIT_STEPS = new Set(['complete', 'submit']);

export function TaxWizard() {
  const { taxYear } = useParams();
  const location = useLocation();
  const { state, dispatch } = useTaxReturn();

  const year = Number.parseInt(taxYear ?? '', 10) || state.activeYear;
  const pathname = location.pathname;
  const last = pathname.split('/').pop() || 'profile';

  const requestedPerson: PersonId =
    new URLSearchParams(location.search).get('section') === 'partner' ||
    new URLSearchParams(location.search).get('person') === 'partner'
      ? 'partner'
      : 'primary';

  useEffect(() => {
    dispatch({ type: 'SET_ACTIVE_YEAR', payload: year });
    dispatch({ type: 'SET_ACTIVE_PERSON', payload: requestedPerson });
  }, [dispatch, requestedPerson, year]);

  let target = 'workspace';
  if (REVIEW_STEPS.has(last)) {
    target = 'review';
  }
  if (SUBMIT_STEPS.has(last)) {
    target = 'submit';
  }

  return <Navigate to={`/return/${year}/person/${requestedPerson}/${target}`} replace />;
}
