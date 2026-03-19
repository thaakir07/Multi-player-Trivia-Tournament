import React, { useState } from 'react';


const SwaggerUI = () => {
  const [expandedEndpoints, setExpandedEndpoints] = useState(new Set());

  const toggleEndpoint = (id: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEndpoints(newExpanded);
  };

  const endpoints = [
    {
        id: 'auth_register',
        method: 'POST',
        path: '/api/register',
        summary: ' Register a new user',
        tags: ['Authentication'],
        parameters: [
            { name: 'username', type: 'string', required: true, description: 'Unique username' },
            { name: 'email', type: 'string', required: true, description: 'Valid email address' },
            { name: 'password', type: 'string', required: true, description: 'Password (min 8 characters)' },
            { name: 'avatar_url', type: 'string', required: false, description: 'Avatar image URL' },
            { name: 'role', type: 'string', required: false, description: 'User role (user/admin)' }
        ],
        responses: {
            200: { description: ' User registered successfully' },
            400: { description: ' Invalid input data' },
            409: { description: ' Username or email already exists' }
        }
    },
    {
        id: 'auth_token_verify',
        method: 'POST',
        path: '/api/token',
        summary: ' Verify JWT token validity',
        tags: ['Authentication'],
        auth: true,
        parameters: [],
        responses: {
            202: { description: ' Token is valid' },
            401: { description: ' Invalid or expired token' }
        }
    },
    {
        id: 'auth_login',
        method: 'POST',
        path: '/api/login',
        summary: ' Login user and receive JWT token',
        tags: ['Authentication'],
        parameters: [
            { name: 'username', type: 'string', required: true, description: 'Username' },
            { name: 'password', type: 'string', required: true, description: 'Password' }
        ],
        responses: {
            200: { description: ' Login successful, returns JWT token' },
            401: { description: ' Invalid credentials' },
            404: { description: ' User not found' }
        }
    },
    
    {
        id: 'user_edit_username',
        method: 'PUT',
        path: '/api/editUsername',
        summary: ' Update user username',
        tags: ['User Management'],
        auth: true,
        parameters: [
            { name: 'newUsername', type: 'string', required: true, description: 'New unique username' }
        ],
        responses: {
            200: { description: ' Username updated successfully' },
            401: { description: ' Unauthorized - invalid token' },
            409: { description: ' Username already taken' }
        }
    },
    {
        id: 'user_edit_password',
        method: 'PUT',
        path: '/api/editPassword',
        summary: ' Update user password',
        tags: ['User Management'],
        auth: true,
        parameters: [
            { name: 'oldPassword', type: 'string', required: true, description: 'Current password' },
            { name: 'newPassword', type: 'string', required: true, description: 'New password' }
        ],
        responses: {
            200: { description: ' Password updated successfully' },
            401: { description: ' Unauthorized or incorrect old password' }
        }
    },
    {
        id: 'user_edit_image',
        method: 'PUT',
        path: '/api/editImage',
        summary: ' Update user avatar',
        tags: ['User Management'],
        auth: true,
        parameters: [
            { name: 'avatar_url', type: 'string', required: true, description: 'New avatar image URL' }
        ],
        responses: {
            200: { description: ' Avatar updated successfully' },
            401: { description: ' Unauthorized - invalid token' }
        }
    },
    {
        id: 'user_get_history',
        method: 'POST',
        path: '/api/getHistory',
        summary: ' Get user match history',
        tags: ['User Management'],
        auth: false,
        parameters: [
            { name: 'userID', type: 'number', required: true, description: 'User ID' }
        ],
        responses: {
            200: { description: ' Match history retrieved' },
            500: { description: ' Server error' }
        }
    },
    {
        id: 'user_get_current_matches',
        method: 'POST',
        path: '/api/getUserCurrentMatches',
        summary: ' Get user current active matches',
        tags: ['User Management'],
        auth: true,
        parameters: [],
        responses: {
            200: { description: ' Current matches retrieved' },
            401: { description: ' Unauthorized' }
        }
    },
    {
        id: 'match_create',
        method: 'POST',
        path: '/api/createMatch',
        summary: ' Create a new trivia match',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'title', type: 'string', required: true, description: 'Match title' },
            { name: 'difficulty', type: 'string', required: true, description: 'easy, medium, or hard' },
            { name: 'numQuestions', type: 'number', required: true, description: 'Number of questions' },
            { name: 'categories', type: 'array', required: true, description: 'Array of category names' }
        ],
        responses: {
            201: { description: ' Match created successfully' },
            400: { description: ' Invalid match parameters' },
            401: { description: ' Unauthorized - login required' }
        }
    },
    {
        id: 'match_get_all',
        method: 'GET',
        path: '/api/getAllMatches',
        summary: ' Get all available matches',
        tags: ['Match Management'],
        auth: true,
        parameters: [],
        responses: {
            200: { description: ' List of all matches' },
            401: { description: ' Unauthorized - login required' }
        }
    },
    {
        id: 'match_join',
        method: 'POST',
        path: '/api/joinMatch',
        summary: ' Join an existing match',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'ID of the match to join' }
        ],
        responses: {
            200: { description: ' Successfully joined match' },
            400: { description: ' Match is full or not available' },
            401: { description: ' Unauthorized - login required' },
            404: { description: ' Match not found' }
        }
    },
    {
        id: 'match_leave',
        method: 'POST',
        path: '/api/leaveMatch',
        summary: ' Leave a match',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'ID of the match to leave' }
        ],
        responses: {
            200: { description: ' Successfully left match' },
            401: { description: ' Unauthorized - login required' },
            404: { description: ' Match not found or not in match' }
        }
    },
    {
        id: 'match_delete',
        method: 'DELETE',
        path: '/api/deleteMatch',
        summary: ' Delete a match (host only)',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'ID of the match to delete' }
        ],
        responses: {
            200: { description: ' Match deleted successfully' },
            401: { description: ' Unauthorized - not the match creator' },
            404: { description: ' Match not found' }
        }
    },
    {
        id: 'question_create',
        method: 'POST',
        path: '/api/createQuestion',
        summary: ' Create a new question (Admin only)',
        tags: ['Question Management'],
        auth: true,
        admin: true,
        parameters: [
            { name: 'role', type: 'string', required: true, description: 'Must be "admin"' },
            { name: 'question', type: 'object', required: true, description: 'Question object with categories, question, difficulty, answer, options' }
        ],
        responses: {
            200: { description: ' Question created successfully' },
            401: { description: ' Unauthorized - admin access required' },
            400: { description: ' Invalid question data' }
        }
    },
    {
        id: 'question_add_bulk',
        method: 'POST',
        path: '/api/addQuestions',
        summary: ' Add multiple questions in bulk',
        tags: ['Question Management'],
        auth: false,
        parameters: [
            { name: 'questions', type: 'array', required: true, description: 'Array of question objects' }
        ],
        responses: {
            208: { description: ' Questions added successfully' },
            500: { description: ' Server error' }
        }
    },
    {
        id: 'match_get_specific',
        method: 'POST',
        path: '/api/getMatch/:matchId',
        summary: ' Get specific match details',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'Match ID in URL path' }
        ],
        responses: {
            200: { description: ' Match details retrieved' },
            404: { description: ' Match not found' },
            403: { description: ' Access denied' }
        }
    },
    {
        id: 'match_get_by_category',
        method: 'POST',
        path: '/api/getMatchesByCategory',
        summary: ' Get matches filtered by categories',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'categories', type: 'array', required: true, description: 'Array of category names' }
        ],
        responses: {
            200: { description: ' Filtered matches retrieved' },
            400: { description: ' Categories required' }
        }
    },
    {
        id: 'match_get_by_activity',
        method: 'POST',
        path: '/api/getMatchesByActivity',
        summary: ' Get matches ordered by activity',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'order', type: 'string', required: false, description: 'asc or desc (query parameter)' }
        ],
        responses: {
            200: { description: ' Matches ordered by activity' },
            401: { description: ' Unauthorized' }
        }
    },
    {
        id: 'match_set_ready',
        method: 'POST',
        path: '/api/setReady',
        summary: ' Set player ready status in match',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'ID of the match' }
        ],
        responses: {
            200: { description: ' Player marked as ready' },
            401: { description: ' Unauthorized' }
        }
    },
    {
        id: 'match_start',
        method: 'POST',
        path: '/api/startMatch',
        summary: ' Start a match (Host only)',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'ID of the match to start' }
        ],
        responses: {
            200: { description: ' Match started successfully' },
            403: { description: ' Only host can start match' },
            404: { description: ' Match not found' }
        }
    },
    {
        id: 'match_get_players',
        method: 'GET',
        path: '/api/getPlayers/:matchId',
        summary: ' Get players in a specific match',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'Match ID in URL path' }
        ],
        responses: {
            200: { description: ' Players list retrieved' },
            401: { description: ' Unauthorized' }
        }
    },
    {
        id: 'match_initialize_questions',
        method: 'POST',
        path: '/api/initializeMatchQuestions',
        summary: ' Initialize questions for a match',
        tags: ['Match Management'],
        auth: true,
        parameters: [
            { name: 'matchId', type: 'number', required: true, description: 'ID of the match' }
        ],
        responses: {
            200: { description: ' Questions initialized' },
            404: { description: ' Match not found' }
        }
    },
    {
        id: 'question_get_all',
        method: 'GET',
        path: '/api/getAllQuestions',
        summary: ' Get all questions (Admin only)',
        tags: ['Question Management'],
        auth: true,
        admin: true,
        parameters: [],
        responses: {
            200: { description: ' List of all questions' },
            401: { description: ' Unauthorized - admin access required' }
        }
    },
    {
        id: 'question_get_difficulty',
        method: 'POST',
        path: '/api/getDifficulty',
        summary: ' Get questions by difficulty level',
        tags: ['Question Management'],
        auth: true,
        parameters: [
            { name: 'difficulty', type: 'string', required: true, description: 'easy, medium, or hard' }
        ],
        responses: {
            203: { description: ' Questions retrieved successfully' },
            401: { description: ' Unauthorized' }
        }
    },
    {
        id: 'question_edit',
        method: 'POST',
        path: '/api/editQuestion',
        summary: ' Edit an existing question (Admin only)',
        tags: ['Question Management'],
        auth: true,
        admin: true,
        parameters: [
            { name: 'role', type: 'string', required: true, description: 'Must be "admin"' },
            { name: 'q', type: 'object', required: true, description: 'Updated question object' }
        ],
        responses: {
            204: { description: ' Question updated successfully' },
            401: { description: ' Unauthorized - admin access required' }
        }
    },
    {
        id: 'category_create',
        method: 'POST',
        path: '/api/createCategory',
        summary: ' Create a new category (Admin only)',
        tags: ['Category Management'],
        auth: true,
        admin: true,
        parameters: [
            { name: 'role', type: 'string', required: true, description: 'Must be "admin"' },
            { name: 'name', type: 'string', required: true, description: 'Category name' }
        ],
        responses: {
            206: { description: ' Category created successfully' },
            401: { description: ' Unauthorized - admin access required' }
        }
    },
    {
        id: 'category_get_questions',
        method: 'POST',
        path: '/api/getCategory',
        summary: ' Get questions by category',
        tags: ['Category Management'],
        auth: true,
        parameters: [
            { name: 'categoryName', type: 'string', required: true, description: 'Name of the category' }
        ],
        responses: {
            206: { description: ' Category questions retrieved' },
            401: { description: ' Unauthorized' }
        }
    },
    {
        id: 'question_search',
        method: 'POST',
        path: '/api/getQuestion',
        summary: ' Search questions by keyword (Admin only)',
        tags: ['Question Management'],
        auth: true,
        admin: true,
        parameters: [
            { name: 'search', type: 'string', required: true, description: 'Search keyword' }
        ],
        responses: {
            200: { description: ' Matching questions' },
            401: { description: ' Unauthorized - admin access required' }
        }
    },
    {
        id: 'question_delete',
        method: 'DELETE',
        path: '/api/deleteQuestion',
        summary: ' Delete a question (Admin only)',
        tags: ['Question Management'],
        auth: true,
        admin: true,
        parameters: [
            { name: 'role', type: 'string', required: true, description: 'Must be "admin"' },
            { name: 'questionId', type: 'number', required: true, description: 'ID of question to delete' }
        ],
        responses: {
            200: { description: ' Question deleted successfully' },
            401: { description: ' Unauthorized - admin access required' },
            404: { description: ' Question not found' }
        }
    },
    {
        id: 'admin_delete_user',
        method: 'DELETE',
        path: '/api/deleteUser',
        summary: ' Delete a user (Admin only)',
        tags: ['Admin Functions'],
        auth: true,
        admin: true,
        parameters: [
            { name: 'role', type: 'string', required: true, description: 'Must be "admin"' },
            { name: 'username', type: 'string', required: true, description: 'Username to delete' }
        ],
        responses: {
            206: { description: ' User deleted successfully' },
            401: { description: ' Unauthorized - admin access required' },
            404: { description: ' User not found' }
        }
    }
  ];

  const groupedEndpoints = endpoints.reduce((groups: { [key: string]: any[] }, endpoint) => {
    const tag = endpoint.tags[0];
    if (!groups[tag]) {
      groups[tag] = [];
    }
    groups[tag].push(endpoint);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-green-600 text-white p-6">
        <h1 className="text-3xl font-bold">Trivia Tournament API</h1>
        <p className="text-green-100 mt-2">Interactive API Documentation</p>
        <div className="mt-4 text-sm">
          <span className="bg-green-700 px-2 py-1 rounded">Base URL: http://localhost:3000</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* API Info */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">API Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Version:</strong> 1.0.0
            </div>
            <div>
              <strong>Authentication:</strong> JWT Bearer Token
            </div>
            <div>
              <strong>Content-Type:</strong> application/json
            </div>
          </div>
        </div>

        {/* Endpoints by Tag */}
        {Object.entries(groupedEndpoints).map(([tag, tagEndpoints]) => (
          <div key={tag} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
              {tag}
            </h2>
            
            <div className="space-y-2">
              {(tagEndpoints as any[]).map((endpoint) => (
                <div key={endpoint.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Endpoint Header */}
                  <div 
                    className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleEndpoint(endpoint.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-white text-sm font-bold`}>
                          {endpoint.method}
                        </span>
                        <code className="text-gray-800 font-mono">{endpoint.path}</code>
                        <span className="text-gray-600">{endpoint.summary}</span>
                        {endpoint.auth && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                            🔒 Auth Required
                          </span>
                        )}
                        {endpoint.admin && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                            👑 Admin Only
                          </span>
                        )}
                      </div>
                      {expandedEndpoints.has(endpoint.id) ? 
                        <span className="text-gray-500">▼</span> : 
                        <span className="text-gray-500">▶</span>
                      }
                    </div>
                  </div>

                  {/* Endpoint Details */}
                  {expandedEndpoints.has(endpoint.id) && (
                    <div className="p-4 bg-white border-t">
                      {/* Parameters */}
                      {endpoint.parameters.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-3">Parameters</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-200 rounded">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-3 text-left border-b">Name</th>
                                  <th className="p-3 text-left border-b">Type</th>
                                  <th className="p-3 text-left border-b">Required</th>
                                  <th className="p-3 text-left border-b">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {endpoint.parameters.map((param: { name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; type: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; required: any; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, idx: React.Key | null | undefined) => (
                                  <tr key={idx} className="border-b last:border-b-0">
                                    <td className="p-3 font-mono text-sm">{param.name}</td>
                                    <td className="p-3 text-sm text-blue-600">{param.type}</td>
                                    <td className="p-3 text-sm">
                                      {param.required ? (
                                        <span className="text-red-600 font-semibold">Yes</span>
                                      ) : (
                                        <span className="text-gray-500">No</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-sm text-gray-700">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Responses */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Responses</h4>
                        <div className="space-y-2">
                          {Object.entries(endpoint.responses).map(([code, response]: [string, any]) => (
                            <div key={code} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                              <span className={`px-2 py-1 rounded text-white text-sm font-bold ${
                                code.startsWith('2') ? 'bg-green-600' :
                                code.startsWith('4') ? 'bg-red-600' :
                                'bg-gray-600'
                              }`}>
                                {code}
                              </span>
                              <span className="text-gray-700">{response.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
          <p>Trivia Tournament API Documentation</p>
          <p className="mt-1">Built with Node.js, Express, PostgreSQL, and Socket.IO</p>
        </div>
      </div>
    </div>
  );
};

export default SwaggerUI;