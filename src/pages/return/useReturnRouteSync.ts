import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTaxReturn, type PersonId } from '../../context/TaxReturnContext';

export function useReturnRouteSync(defaultPerson: PersonId = 'primary') {
  const { taxYear, personId } = useParams();
  const { state, dispatch } = useTaxReturn();

  const parsedYear = Number.parseInt(taxYear ?? '', 10) || state.activeYear;
  const parsedPerson: PersonId = personId === 'partner' ? 'partner' : defaultPerson;

  useEffect(() => {
    dispatch({ type: 'SET_ACTIVE_YEAR', payload: parsedYear });
    dispatch({ type: 'SET_ACTIVE_PERSON', payload: parsedPerson });
  }, [dispatch, parsedPerson, parsedYear]);

  return {
    year: parsedYear,
    personId: parsedPerson
  };
}

