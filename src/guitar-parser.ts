/**
 * AlphaTex Guitar Track Extractor
 * Preserves header metadata and extracts only guitar tracks
 */

class AlphaTexGuitarParser {
  private readonly guitarKeywords: string[];

  constructor() {
    this.guitarKeywords = [
      "guitar",
      "e-gt",
      "s-gt",
      "distortion",
      "overdriven",
      "clean",
      "distortionguitar",
      "electric",
      "acoustic",
      "steel",
      "nylon",
      "jazz",
      "rock",
      "metal",
      "lead",
      "rhythm",
      "muted",
      "harmonics",
      "feedback",
      "chorus",
      "funk",
      "hawaiian",
      "mid tone",
      "pinch",
      "overdrive",
      "bass",        // Added for Track 3
      "ukulele",     // Added for completeness
      "mandolin",    // Added for completeness
      "banjo"        // Added for completeness
    ];
  }

  public parse(alphaTexString: string): string {
    const lines = alphaTexString.split("\n");
    const result: string[] = [];

    let inHeader = true;
    let inTrack = false;
    let currentTrackHasGuitar = false;
    let currentTrack: string[] = [];
    let trackCount = 0;
    let guitarCount = 0;
    let headerContent: string[] = [];

    console.log("🎸 Scanning for guitar tracks...\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip if line is undefined
      if (line === undefined) continue;

      const trimmed = line.trim();

      // Skip empty lines in header (optional)
      // if (inHeader && trimmed === "") continue;

      if (
        trimmed.startsWith("\\track") ||
        trimmed.startsWith("[track]") ||
        trimmed.startsWith("TRACK")
      ) {
        inHeader = false;

        if (inTrack) {
          if (currentTrackHasGuitar) {
            result.push(...currentTrack);
            result.push(""); // Add blank line between tracks
            guitarCount++;
            console.log(`✅ Track ${trackCount}: GUITAR - KEPT`);
          } else {
            console.log(`❌ Track ${trackCount}: Not guitar - SKIPPED`);
          }
        }

        inTrack = true;
        currentTrackHasGuitar = false;
        currentTrack = [line];
        trackCount++;

        if (this.isGuitarInstrument(line)) {
          currentTrackHasGuitar = true;
          console.log(`   Found guitar in track header: "${this.extractTrackName(line)}"`);
        }
      } else if (inHeader) {
        if (trimmed !== "") {
          headerContent.push(line);
        }
      } else if (inTrack) {
        if (
          trimmed.includes("instrument") &&
          this.isGuitarInstrument(trimmed)
        ) {
          currentTrackHasGuitar = true;
          console.log(`   Found guitar instrument: "${trimmed}"`);
        }
        currentTrack.push(line);
      }
    }

    // Process the last track
    if (inTrack) {
      if (currentTrackHasGuitar) {
        result.push(...currentTrack);
        guitarCount++;
        console.log(`✅ Track ${trackCount}: GUITAR - KEPT`);
      } else {
        console.log(`❌ Track ${trackCount}: Not guitar - SKIPPED`);
      }
    }

    const finalResult = [...headerContent, ...result];

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   Header lines preserved: ${headerContent.length}`);
    console.log(`   Total tracks: ${trackCount}`);
    console.log(`   Guitar tracks: ${guitarCount}`);
    console.log(`   Other tracks: ${trackCount - guitarCount}`);

    return finalResult.join("\n");
  }

  private isGuitarInstrument(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.guitarKeywords.some((keyword) =>
      lowerText.includes(keyword.toLowerCase()),
    );
  }

  private extractTrackName(line: string): string {
    const match = line.match(/\("([^"]+)"\s+"([^"]+)"\)/);
    if (match) {
      return `${match[1]} (${match[2]})`;
    }
    return line.substring(0, 30) + "...";
  }
}

// Your multi-guitar content
const aTexContent = `\\artist "Guitar Ensemble"
\\copyright "Copyright 2024"
\\title "Three Guitars Concerto"
\\subtitle "Demo for Guitar Track Extractor"
\\systemsLayout (4 4 4 4 4 4)

% ========================================
% Track 1: Lead Electric Guitar - SHOULD BE KEPT
% ========================================
\\track ("Lead Guitar" "E-Gt") {
  color "#FF3333"
  systemsLayout (8 5 2 2 3 3 3 3)
  volume 12
  balance 8
  instrument distortionguitar
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2)
    \\ts (4 4)
    \\tempo 120
    \\ks c
      12.2{v}.2{f}
      14.2{v acc #}.4
      15.2.8
      17.2.8
    |
      14.1{v acc #}.2
      17.2.8
      15.1.8
    |

% ========================================
% Track 2: Rhythm Acoustic Guitar - SHOULD BE KEPT
% ========================================
\\track ("Acoustic Rhythm" "A-Gt") {
  color "#33FF33"
  systemsLayout (8 5 2 2 3 3 3 3)
  volume 10
  balance 8
  instrument acoustic guitar
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2)
    \\ts (4 4)
    \\tempo 120
    \\ks c
      (3.2 2.2 0.2).4
      3.2.8
      0.2.8
      (5.3 3.3 2.3).4
    |
      5.3.8
      3.3.8
      (7.3 5.3 3.3).4
    |

% ========================================
% Track 3: Bass Guitar - SHOULD BE KEPT (if 'bass' in keywords)
% ========================================
\\track ("Bass Guitar" "B-Gt") {
  color "#3333FF"
  systemsLayout (8 5 2 2 3 3 3 3)
  volume 14
  balance 8
  instrument bass
}
  \\staff {
    score
    tabs
  }
    \\tuning (E2 A2 D3 G3)
    \\ts (4 4)
    \\tempo 120
    \\ks c
      0.2.4
      2.2.4
      3.2.4
      5.2.4
    |
      7.2.4
      8.2.4
      9.2.4
      10.2.4
    |

% ========================================
% Track 4: Piano - SHOULD BE SKIPPED
% ========================================
\\track ("Grand Piano" "Pno") {
  color "#FF33FF"
  volume 10
  balance 8
  instrument acoustic grand piano
}
  \\staff {
    score
  }
    \\clef treble
    \\ts (4 4)
    \\tempo 120
    \\ks c
      c4 e g c'
      e g c' e'
      g c' e' g'
    |

% ========================================
% Track 5: Clean Electric Guitar - SHOULD BE KEPT
% ========================================
\\track ("Clean Guitar" "C-Gt") {
  color "#33FFFF"
  systemsLayout (8 5 2 2 3 3 3 3)
  volume 9
  balance 8
  instrument clean electric guitar
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2)
    \\ts (4 4)
    \\tempo 90
    \\ks c
      7.2.4
      8.2.4
      9.2.4
      10.2.4
    |
      7.3.4
      8.3.4
      9.3.4
      10.3.4
    |

% ========================================
% Track 6: Strings - SHOULD BE SKIPPED
% ========================================
\\track ("Violin Section" "Vln") {
  color "#FFFF33"
  volume 11
  balance 8
  instrument violin
}
  \\staff {
    score
  }
    \\clef treble
    \\ts (4 4)
    \\tempo 120
    \\ks c
      g4 a b c''
      d'' e'' f'' g''
      a'' b'' c''' d'''
    |

% ========================================
% Track 7: Jazz Guitar - SHOULD BE KEPT
% ========================================
\\track ("Jazz Guitar" "J-Gt") {
  color "#FF9933"
  systemsLayout (8 5 2 2 3 3 3 3)
  volume 8
  balance 8
  instrument jazz guitar
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2)
    \\ts (4 4)
    \\tempo 140
    \\ks c
      (7.3 7.4 5.5).4
      5.5{pm}.8
      5.5{pm}.8
      8.2.8
    |
      7.2{acc #}.8
      5.2.8
      7.3.8
      9.3.8
    |

% ========================================
% Track 8: Drums - SHOULD BE SKIPPED
% ========================================
\\track ("Drum Kit" "Drums") {
  color "#9933FF"
  volume 15
  balance 8
  instrument percussion
}
  \\staff {
    score
  }
    \\clef percussion
    \\ts (4 4)
    \\tempo 120
    \\ks c
      "Kick".4 "Snare".4 "Hi-Hat".4 "Kick".4
      "Snare".4 "Hi-Hat".4 "Kick".4 "Snare".4
      "Crash".4 "Ride".4 "Tom".4 "Snare".4
    |

% ========================================
% Track 9: Classical Nylon Guitar - SHOULD BE KEPT
% ========================================
\\track ("Nylon Guitar" "N-Gt") {
  color "#33FF99"
  systemsLayout (8 5 2 2 3 3 3 3)
  volume 7
  balance 8
  instrument nylon-string guitar
}
  \\staff {
    score
    tabs
  }
    \\tuning (E4 B3 G3 D3 A2 E2)
    \\ts (3 4)
    \\tempo 80
    \\ks c
      0.2.4
      2.2.4
      3.2.4
      5.2.4
    |
      7.2.4
      8.2.4
      9.2.4
      10.2.4
    |
      12.2.4
      14.2.4
      15.2.4
      17.2.4
    |

% ========================================
% Track 10: Flute - SHOULD BE SKIPPED
% ========================================
\\track ("Flute" "Fl") {
  color "#FF99FF"
  volume 6
  balance 8
  instrument flute
}
  \\staff {
    score
  }
    \\clef treble
    \\ts (4 4)
    \\tempo 100
    \\ks c
      c'''4 d''' e''' f'''
      g''' a''' b''' c''''
      d'''' e'''' f'''' g''''
    |
`;

function main(): void {
  console.log("\n" + "🎸".repeat(10));
  console.log("   AlphaTex Guitar Track Extractor");
  console.log("🎸".repeat(10) + "\n");

  const parser = new AlphaTexGuitarParser();
  const result = parser.parse(aTexContent);

  console.log("\n" + "=".repeat(50));
  console.log("📄 FINAL OUTPUT (Header + Guitar Tracks):");
  console.log("=".repeat(50));

  const lines = result.split("\n");
  
  // Show first 30 lines as preview
  const previewLines = lines.slice(0, 1000);
  console.log(previewLines.join("\n"));

  // if (lines.length > 30) {
  //   console.log(`\n... and ${lines.length - 30} more lines`);
  // }

  console.log(`\n✅ Successfully extracted!`);
  console.log(`   Total output lines: ${lines.length}`);
  console.log(`   Total output size: ${result.length} characters`);
}

main();