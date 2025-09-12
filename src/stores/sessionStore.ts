import { create } from 'zustand';

interface Property {
  id: number;
  propId: string;
  ownerName: string | null;
  situsAddr: string | null;
  mailAddr: string | null;
  landValue: number | null;
  mktValue: number | null;
  gisArea: number | null;
}

interface EditablePropertyData {
  propertyId: number;
  firstName: string;
  middleName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface ContactData {
  mobiles: string[];
  landlines: string[];
  emails: string[];
}

interface SkipTraceSession {
  id: string;
  timestamp: Date;
  provider: string;
  properties: Property[];
  inputData: Record<number, EditablePropertyData>;
  results: Record<number, ContactData>;
  successRate: number;
  totalProperties: number;
}

interface SessionStore {
  sessions: SkipTraceSession[];
  viewMode: 'input' | 'results';
  
  createSession: (properties: Property[], provider: string, inputData: Record<number, EditablePropertyData>) => string;
  addResultsToSession: (sessionId: string, propertyId: number, contactData: ContactData) => void;
  toggleViewMode: () => void;
  deleteSession: (sessionId: string) => void;
  exportSession: (sessionId: string) => void;
  getSessionResults: (sessionId?: string) => Record<number, ContactData>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  viewMode: 'input',
  
  createSession: (properties: Property[], provider: string, inputData: Record<number, EditablePropertyData>) => {
    const state = get();
    const sessionLetter = String.fromCharCode(65 + state.sessions.length); // A, B, C, etc.
    const sessionId = `session_${sessionLetter}`;
    
    const newSession: SkipTraceSession = {
      id: sessionId,
      timestamp: new Date(),
      provider,
      properties,
      inputData,
      results: {},
      successRate: 0,
      totalProperties: properties.length
    };
    
    set(state => ({
      sessions: [...state.sessions, newSession]
    }));
    
    return sessionId;
  },
  
  addResultsToSession: (sessionId: string, propertyId: number, contactData: ContactData) => {
    set(state => ({
      sessions: state.sessions.map(session => {
        if (session.id === sessionId) {
          const updatedResults = { ...session.results, [propertyId]: contactData };
          const successCount = Object.values(updatedResults).filter(
            result => result.mobiles.length > 0 || result.landlines.length > 0 || result.emails.length > 0
          ).length;
          
          return {
            ...session,
            results: updatedResults,
            successRate: Math.round((successCount / session.totalProperties) * 100)
          };
        }
        return session;
      })
    }));
  },
  
  toggleViewMode: () => set(state => ({
    viewMode: state.viewMode === 'input' ? 'results' : 'input'
  })),
  
  deleteSession: (sessionId: string) => set(state => ({
    sessions: state.sessions.filter(session => session.id !== sessionId)
  })),
  
  exportSession: (sessionId: string) => {
    const { sessions } = get();
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const csvData = session.properties.map(property => {
      const result = session.results[property.id];
      const input = session.inputData[property.id];
      
      return {
        'Session': session.id,
        'Timestamp': session.timestamp.toISOString(),
        'Property ID': property.propId,
        'Owner Name': property.ownerName || '',
        'Property Address': property.situsAddr || '',
        'Input First Name': input?.firstName || '',
        'Input Last Name': input?.lastName || '',
        'All Mobile Phones': result?.mobiles.join('\n') || '',
        'All Landline Phones': result?.landlines.join('\n') || '',
        'All Emails': result?.emails.join('\n') || '',
        'Contact Found': result ? 'Yes' : 'No'
      };
    });

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skip-trace-session-${sessionId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  getSessionResults: (sessionId?: string) => {
    const { sessions } = get();
    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      return session?.results || {};
    }
    
    const allResults: Record<number, ContactData> = {};
    sessions.forEach(session => {
      Object.entries(session.results).forEach(([propertyId, result]) => {
        allResults[Number(propertyId)] = result;
      });
    });
    return allResults;
  }
}));
