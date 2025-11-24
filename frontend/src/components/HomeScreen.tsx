// // src/components/HomeScreen.tsx
// import React from 'react';
// import { Box, Typography } from '@mui/material';

// const HomeScreen: React.FC = () => {
//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h4" gutterBottom>
//         Bienvenido 👋
//       </Typography>
//       <Typography variant="body1">
//         Usa el menú lateral para acceder al chatbot educativo.
//       </Typography>
//     </Box>
//   );
// };

// export default HomeScreen;
// src/components/HomeScreen.tsx
// src/components/HomeScreen.tsx
// src/components/HomeScreen.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const HomeScreen: React.FC = () => {
  return (
    <Box 
      sx={{ 
        p: 2,
        minHeight: '100vh',
        backgroundColor: '#F0F8FF',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(135, 206, 250, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(255, 182, 193, 0.15) 0%, transparent 50%)
        `,
      }}
    >
      <Box
        sx={{
          maxWidth: '700px',
          margin: '60px auto',
          textAlign: 'center',
        }}
      >
        {/* Ilustración superior con iconos matemáticos */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <Box sx={{ fontSize: '60px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>🧮</Box>
          <Box sx={{ fontSize: '60px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>📚</Box>
          <Box sx={{ fontSize: '60px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>🎯</Box>
        </Box>

        {/* Tarjeta principal */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '3px solid #E3F2FD',
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              color: '#1976D2',
              fontWeight: 'bold',
              fontSize: '2.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            Bienvenido 👋
          </Typography>
          
          <Box sx={{ fontSize: '80px', margin: '20px 0' }}>🤖</Box>
          
          <Typography 
            variant="body1"
            sx={{
              color: '#424242',
              fontSize: '1.2rem',
              lineHeight: 1.6,
            }}
          >
            Usa el menú lateral para acceder a nuestras opciones.
          </Typography>
        </Box>

        {/* Iconos decorativos inferiores */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginTop: '30px',
          }}
        >
          <Box sx={{ fontSize: '50px' }}>✏️</Box>
          <Box sx={{ fontSize: '50px' }}>🌟</Box>
          <Box sx={{ fontSize: '50px' }}>🎨</Box>
          <Box sx={{ fontSize: '50px' }}>🚀</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeScreen;