import assert from 'assert';

export function assertThat(test: boolean, message?: string): asserts test is true {
    assert(test, message);
} 