import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Animated, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

export default function App() {
  const [text, setText] = useState('');
  const [letters, setLetters] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [letterOrder, setLetterOrder] = useState<number[]>([]);
  const animatedValues = useRef<Animated.Value[]>([]);
  const previousPositions = useRef<{x: number, y: number}[]>([]);

  // Initialize or update animated values when letters change
  useEffect(() => {
    if (letters.length > 0) {
      // Reset or create animated values for each letter
      animatedValues.current = letters.map((_, i) => 
        animatedValues.current[i] || new Animated.Value(0)
      );
      
      // Calculate initial positions
      const positions = letters.map((_, index) => {
        const angle = (index / letters.length) * 2 * Math.PI;
        const radius = 100;
        return {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle)
        };
      });
      previousPositions.current = positions;
    }
  }, [letters]);

  // Capture current positions before changing order
  const captureCurrentPositions = () => {
    return letterOrder.map((letterIndex, positionIndex) => {
      const angle = (positionIndex / letterOrder.length) * 2 * Math.PI;
      const radius = 100;
      return {
        letterIndex,
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
    });
  };

  // Update letter order when letters change or shuffle state changes
  useEffect(() => {
    if (letters.length > 0) {
      if (shuffled) {
        // Capture current positions before shuffling
        const currentPositions = captureCurrentPositions();
        
        // Create shuffled order of indices
        const indices = [...Array(letters.length).keys()];
        // Fisher-Yates shuffle
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Update positions reference for each letter
        currentPositions.forEach(pos => {
          previousPositions.current[pos.letterIndex] = {
            x: pos.x,
            y: pos.y
          };
        });
        
        setLetterOrder(indices);
        
        // Animate the transition
        animateLetterMovement();
      } else {
        // Capture current positions before resetting
        if (letterOrder.length > 0) {
          const currentPositions = captureCurrentPositions();
          currentPositions.forEach(pos => {
            previousPositions.current[pos.letterIndex] = {
              x: pos.x,
              y: pos.y
            };
          });
        }
        
        // Normal sequential order
        setLetterOrder([...Array(letters.length).keys()]);
        
        // Animate the transition (if not the initial render)
        if (animatedValues.current.length > 0 && letterOrder.length > 0) {
          animateLetterMovement();
        }
      }
    }
  }, [letters, shuffled]);

  const animateLetterMovement = () => {
    // Reset all animations to starting position
    animatedValues.current.forEach(anim => {
      anim.setValue(0);
    });

    // Create animations for all letters
    const animations = animatedValues.current.map(anim => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      });
    });

    // Start all animations together
    Animated.parallel(animations).start();
  };

  const handleButtonPress = () => {
    if (letters.length === 0) {
      // No letters yet - handle input submission
      if (text.trim()) {
        // Convert the input text to an array of individual characters
        const letterArray = text.split('');
        setLetters(letterArray);
        setText('');
        setShuffled(false);
      }
    } else {
      // Letters already displayed - handle shuffle
      setShuffled(!shuffled);
    }
  };

  // Get the appropriate button text based on app state
  const getButtonText = () => {
    if (letters.length === 0) {
      return "Arrange";
    } else {
      return shuffled ? "Reset" : "Shuffle";
    }
  };

  // Determine button color based on app state
  const getButtonStyle = () => {
    if (letters.length === 0) {
      return [styles.button, !text.trim() && styles.buttonDisabled];
    } else {
      return [styles.button, shuffled ? styles.buttonReset : styles.buttonShuffle];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.titleContainer}>
        <Text style={styles.emoji}>🔤🥣</Text>
        <Text style={styles.title}>Alphabet Soup</Text>
      </View>
      
      <View style={styles.mainContent}>
        <View style={styles.circleContainer}>
          {letters.length > 0 && letterOrder.length > 0 && (
            <View style={styles.circle}>
              {letterOrder.map((letterIndex, positionIndex) => {
                // Calculate new position on the circle
                const angle = (positionIndex / letterOrder.length) * 2 * Math.PI;
                const radius = 100; // Radius of the circle
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                
                // Get previous position from ref (or use current if not available)
                const prevPos = previousPositions.current[letterIndex] || {x, y};
                
                // Interpolate between old and new positions
                const animatedX = animatedValues.current[letterIndex]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [prevPos.x, x],
                }) || x;
                
                const animatedY = animatedValues.current[letterIndex]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [prevPos.y, y],
                }) || y;
                
                return (
                  <Animated.View
                    key={letterIndex}
                    style={[
                      styles.letter,
                      {
                        transform: [
                          { translateX: animatedX },
                          { translateY: animatedY }
                        ]
                      }
                    ]}
                  >
                    <Text style={styles.letterText}>{letters[letterIndex]}</Text>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
        
        {letters.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>Enter some letters below to get started!</Text>
          </View>
        )}
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.bottomControls}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Enter letters..."
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={letters.length === 0 ? handleButtonPress : undefined}
            editable={letters.length === 0}
          />
          
          <TouchableOpacity 
            style={getButtonStyle()} 
            onPress={handleButtonPress}
            disabled={letters.length === 0 && !text.trim()}
          >
            <Text style={styles.buttonText}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  circleContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  letter: {
    position: 'absolute',
    width: 46,
    height: 46,
    backgroundColor: 'white',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    left: 77, // Half of circle width minus half of letter width
    top: 77, // Half of circle height minus half of letter height
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  letterText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444',
  },
  bottomControls: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    backgroundColor: '#5A67F2',
    shadowColor: '#5A67F2',
  },
  buttonDisabled: {
    backgroundColor: '#A0A8E6',
    shadowOpacity: 0.1,
  },
  buttonShuffle: {
    backgroundColor: '#21D07D',
    shadowColor: '#21D07D',
  },
  buttonReset: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
