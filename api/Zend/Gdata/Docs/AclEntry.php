<?php




class Zend_Gdata_Docs_AclEntry extends Zend_Gdata_Entry
{
    protected $_entryClassName = 'Zend_Gdata_Docs_AclEntry';

    /**
     * The role for the user
     * @var Zend_Gdata_Acl_Role
     */
    protected $_aclRole;

    /**
     * The scope of the user role.
     * @var Zend_Gdata_Acl_Scope
     */
    protected $_aclScope;

    /**
     * Create a new instance of an entry representing a document ACL.
     *
     * @param DOMElement $element (optional) DOMElement from which this
     *          object should be constructed.
     */
    public function __construct($element = null)
    {
        $this->registerAllNamespaces(Zend_Gdata_Docs::$namespaces);
        $this->registerNamespace('gAcl', 'http://schemas.google.com/acl/2007');
        // NOTE: namespaces must be registered before calling parent
        parent::__construct($element);
    }

    public function getDOM($doc=null, $majorVersion=1, $minorVersion=null)
    {
        $element = parent::getDOM($doc, $majorVersion, $minorVersion);
        if ($this->_aclRole != null) {
            $element->appendChild($this->_aclRole->getDOM($element->ownerDocument, $majorVersion, $minorVersion));
        }
        if ($this->_aclScope != null) {
            $element->appendChild($this->_aclScope->getDOM($element->ownerDocument, $majorVersion, $minorVersion));
        }
        return $element;
    }

    protected function takeChildFromDOM($child)
    {
        $absoluteNodeName = $child->namespaceURI . ':' . $child->localName;
        switch ($absoluteNodeName) {
            case $this->lookupNamespace('gAcl') . ':role':
                $aclRole = new Zend_Gdata_Acl_Role();
                $aclRole->transferFromDOM($child);
                $this->_aclRole = $aclRole;
                break;
            case $this->lookupNamespace('gAcl') . ':scope':
                $aclScope = new Zend_Gdata_Acl_Scope();
                $aclScope->transferFromDOM($child);
                $this->_aclScope = $aclScope;
                break;
            default:
                parent::takeChildFromDOM($child);
                break;
        }
    }

    /**
     * Gets the role of this ACL entry.
     * @return Zend_Gdata_Acl_Role
     */
    public function getAclRole()
    {
        return $this->_aclRole;
    }

    /**
     * Sets the role of this ACL entry.
     * @param Zend_Gdata_Acl_Role $aclRole
     * @return Zend_Gdata_Docs_AclEntry Provides a fluent interface.
     */
    public function setAclRole($aclRole)
    {
        $this->_aclRole = $aclRole;
        return $this;
    }

    /**
     * Gets the scope of this ACL entry.
     * @return Zend_Gdata_Acl_Scope
     */
    public function getAclScope()
    {
        return $this->_aclScope;
    }

    /**
     * Sets the scope of this ACL entry.
     * @param Zend_Gdata_Acl_Scope $aclScope
     * @return Zend_Gdata_Docs_AclEntry Provides a fluent interface.
     */
    public function setAclScope($aclScope)
    {
        $this->_aclScope = $aclScope;
        return $this;
    }
}
