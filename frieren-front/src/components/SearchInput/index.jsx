/*
 * Project: Frieren Framework
 * Copyright (C) 2026 DSR! <xchwarze@gmail.com>
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * More info at: https://github.com/xchwarze/frieren
 */
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

import Icon from '@src/components/Icon';

/**
 * Reusable search input with icon and clear button.
 *
 * @param {string} value - Current search value.
 * @param {Function} onChange - Called with new value on input change.
 * @param {string} [placeholder] - Input placeholder text.
 * @param {string} [className] - Additional CSS classes for the InputGroup.
 * @return {ReactElement} The SearchInput component.
 */
const SearchInput = ({ value, onChange, placeholder = 'Search...', className = 'mb-3' }) => (
    <InputGroup className={className}>
        <InputGroup.Text>
            <Icon name={'search'} />
        </InputGroup.Text>
        <Form.Control
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        {value && (
            <Button
                variant={'outline-secondary'}
                aria-label={'Clear search'}
                onClick={() => onChange('')}
            >
                <Icon name={'x'} />
            </Button>
        )}
    </InputGroup>
);

SearchInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
};

export default SearchInput;
