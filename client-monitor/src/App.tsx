import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import { PrivateRoute } from './auth/PrivateRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientForm } from './pages/ClientForm';
import { ClientDetails } from './pages/ClientDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route 
                  path="/clients/new" 
                  element={
                    <PrivateRoute roles={['admin']} fallback={
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
                        <p className="text-gray-600 mt-2">Apenas administradores podem criar novos clientes</p>
                      </div>
                    }>
                      <ClientForm />
                    </PrivateRoute>
                  } 
                />
                <Route path="/clients/:id" element={<ClientDetails />} />
                <Route 
                  path="/clients/:id/edit" 
                  element={
                    <PrivateRoute roles={['admin']} fallback={
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
                        <p className="text-gray-600 mt-2">Apenas administradores podem editar clientes</p>
                      </div>
                    }>
                      <ClientForm />
                    </PrivateRoute>
                  } 
                />
                <Route path="/activity" element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Atividade</h2>
                    <p className="text-gray-600 mt-2">Em desenvolvimento</p>
                  </div>
                } />
                <Route path="/settings" element={
                  <PrivateRoute roles={['admin']} fallback={
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900">Acesso Restrito</h2>
                      <p className="text-gray-600 mt-2">Apenas administradores podem acessar configurações</p>
                    </div>
                  }>
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
                      <p className="text-gray-600 mt-2">Em desenvolvimento</p>
                    </div>
                  </PrivateRoute>
                } />
              </Routes>
            </Layout>
          </PrivateRoute>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;