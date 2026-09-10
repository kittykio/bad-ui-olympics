import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** Keep development chunks separate from production build output. */
export default function config(phase) {
  return {
    distDir: process.env.NEXT_DIST_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next'),
  };
}
