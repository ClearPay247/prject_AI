export interface NameComponents {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
}

export const parseNameComponents = (fullName: string | null): NameComponents => {
  if (!fullName?.trim()) {
    return { firstName: null, middleName: null, lastName: null };
  }

  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: null, lastName: null };
  }
  
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: null, lastName: parts[1] };
  }
  
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1]
  };
};

export const combineNameComponents = (
  firstName: string | null | undefined,
  middleName: string | null | undefined,
  lastName: string | null | undefined
): string => {
  return [firstName, middleName, lastName]
    .filter(part => part?.trim())
    .join(' ')
    .trim();
};